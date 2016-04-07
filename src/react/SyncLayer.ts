module n3Charts.Factory {
  'use strict';

  export class ReactSyncLayer extends Factory.BaseFactory {

    static tooltipSyncLayers = {};
    static domainSyncLayers = {};

    private unregisteringFunctions: Function[];

    constructor(private properties: any) {
      super();
    }

    create() {
      this.unregisteringFunctions = [];

      this.sanitizeAttributes();
      this.syncTooltips();
      this.syncDomainsChange();
      this.syncDatumEvents();
    }

    sanitizeAttributes() {
      let {tooltipSyncKey, domainsSyncKey} = this.properties;
      if (!!tooltipSyncKey && !!domainsSyncKey) {
        if (tooltipSyncKey === domainsSyncKey) {
          throw new Error('Heterogeneous sync keys can\'t have the same value.');
        }
      }
    }

    syncDatumEvents() {
      let eventMgr: Utils.EventManager = this.eventMgr;

      if (!!this.properties.onClick) {
        eventMgr.on('click.sync-layer', (d, i, series, options) => {
          this.properties.onClick(d, i, series, options);
        });
      }
    }

    outerWorldHover(value) {
      this.eventMgr.triggerDataAndOptions('outer-world-hover', value);
    }

    syncTooltips() {
      if (!!this.properties.tooltipSyncKey) {
        var key = this.properties.tooltipSyncKey;
        var layers = ReactSyncLayer.tooltipSyncLayers[key] || [];
        layers.push(this);
        ReactSyncLayer.tooltipSyncLayers[key] = layers

        this.eventMgr.on('container-move.sync-layer', (event) => {
          layers.forEach((layer) => {
            if (layer !== this) {
              layer.outerWorldHover(this.factoryMgr.get('container').getCoordinatesFromEvent(event));
            }
          });
        });

        this.eventMgr.on('container-out.sync-layer', () => {
          layers.forEach((layer) => {
            if (layer !== this) {
              layer.outerWorldHover({ x: undefined, y: undefined });
            }
          });
        });
      }
    }

    outerWorldSync(domains, type) {
      let xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      let x2Axis = <Factory.Axis>this.factoryMgr.get('x2-axis');
      let yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');
      let y2Axis = <Factory.Axis>this.factoryMgr.get('y2-axis');

      if (!domains.x || !domains.y || !domains.x2 || !domains.y2) {
        domains = n3Charts.Utils.ObjectUtils.extend({}, domains);
      }

      if (!domains.x) {
        domains.x = xAxis.getScaleDomain();
      }

      if (!domains.x2) {
        domains.x2 = x2Axis.getScaleDomain();
      }

      if (!domains.y) {
        domains.y = <number[]>yAxis.getScaleDomain();
      }

      if (!domains.y2) {
        domains.y2 = <number[]>y2Axis.getScaleDomain();
      }

      if (type === 'zoom-end') {
        this.eventMgr.trigger('outer-world-domain-change', domains);
        this.factoryMgr.turnFactoriesOn(['tooltip']);

      } else if (type === 'zoom') {
        this.factoryMgr.turnFactoriesOff(['tooltip']);

      } else if (type === 'pan' || type === 'pan-end') {
        this.factoryMgr.turnFactoriesOff(['transitions', 'tooltip']);
        this.eventMgr.trigger('outer-world-domain-change', domains);

        if (type === 'pan-end') {
          this.factoryMgr.turnFactoriesOn(['transitions', 'tooltip']);
        }

      } else if (type === 'zoom-pan-reset') {
        this.eventMgr.trigger('zoom-pan-reset', false);
      }
    }

    syncDomainsChange() {
      let callbacks = [];
      let xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      let yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      if (!!this.properties.onDomainsChange) {
        callbacks.push((domains, {isEndEvent}) => {
          if (isEndEvent) {
            this.properties.onDomainsChange(domains);
          }
        });
      }

      if (!!this.properties.domainsSyncKey) {
        var key = this.properties.domainsSyncKey;
        var layers = ReactSyncLayer.domainSyncLayers[key] || [];
        layers.push(this);
        ReactSyncLayer.domainSyncLayers[key] = layers

        callbacks.push((domains:Utils.IDomains, {type}) => {
          layers.forEach((layer) => {
            if (layer !== this) {
              layer.outerWorldSync(domains, type);
            }
          });
        });
      }

      let getDomains = ():Utils.IDomains => {
        return {x: xAxis.getScaleDomain(), y: <number[]>yAxis.getScaleDomain()};
      };
      let ping = (domains, args) => callbacks.forEach(fn => fn(domains, args));

      this.eventMgr.on('pan.sync-layer', () => {
        let domains = getDomains();
        (<Factory.Pan>this.factoryMgr.get('pan')).constrainDomains(domains);
        ping(domains, {type: 'pan'});
      });

      this.eventMgr.on('pan-end.sync-layer', () => {
        let domains = getDomains();
        (<Factory.Pan>this.factoryMgr.get('pan')).constrainDomains(domains);
        ping(domains, {type: 'pan-end', isEndEvent: true});
      });

      this.eventMgr.on('zoom.sync-layer', () => {
        let domains = getDomains();
        (<Factory.Zoom>this.factoryMgr.get('zoom')).constrainOutgoingDomains(domains);
        ping(domains, {type: 'zoom', isEndEvent: false});
      });

      this.eventMgr.on('zoom-end.sync-layer', () => {
        let domains = getDomains();
        (<Factory.Zoom>this.factoryMgr.get('zoom')).constrainOutgoingDomains(domains);
        ping(domains, {type: 'zoom-end', isEndEvent: true});
      });

      this.eventMgr.on('zoom-pan-reset.sync-layer', (madeHere) => {
        if (madeHere) {
          ping(getDomains(), {type: 'zoom-pan-reset', isEndEvent: true});
        }
      });
    }

    destroy() {
      var fn;
      while (fn = this.unregisteringFunctions.pop()) {
        fn();
      }
    }
  }
}
