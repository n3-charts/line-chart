module n3Charts.Factory {
  'use strict';

  export class AngularJSSyncLayer extends Factory.BaseFactory {

    private unregisteringFunctions: Function[];

    constructor(private scope: ng.IScope, private attributes: any, private $parse: ng.IParseService) {
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
      let {tooltipSyncKey, domainsSyncKey} = this.attributes;
      if (!!tooltipSyncKey && !!domainsSyncKey) {
        if (tooltipSyncKey === domainsSyncKey) {
          throw new Error('Heterogeneous sync keys can\'t have the same value.');
        }
      }
    }

    syncDatumEvents() {
      let eventMgr: Utils.EventManager = this.eventMgr;

      if (!!this.attributes.onClick) {
        var onClick = this.$parse(this.attributes.onClick);

        eventMgr.on('click.sync-layer', (d, i, series, options) => {
          onClick(this.scope.$parent, {row: d, index: i, series, options});
        });
      }
    }

    syncTooltips() {
      let eventMgr: Utils.EventManager = this.eventMgr;

      if (!!this.attributes.tooltipSyncKey) {
        this.unregisteringFunctions.push(
          this.scope.$root.$on(this.attributes.tooltipSyncKey, (event, value) => {
            eventMgr.triggerDataAndOptions('outer-world-hover', value);
          })
        );

        eventMgr.on('container-move.sync-layer', (event) => {
          this.scope.$emit(
            this.attributes.tooltipSyncKey,
            this.factoryMgr.get('container').getCoordinatesFromEvent(event)
          );
        });

        eventMgr.on('container-out.sync-layer', () => {
          this.scope.$emit(this.attributes.tooltipSyncKey, { x: undefined, y: undefined });
        });
      }
    }


    syncDomainsChange() {
      let eventMgr: Utils.EventManager = this.eventMgr;
      let callbacks = [];
      let xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      let x2Axis = <Factory.Axis>this.factoryMgr.get('x2-axis');
      let yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');
      let y2Axis = <Factory.Axis>this.factoryMgr.get('y2-axis');

      if (!!this.attributes.onDomainsChange) {
        var onDomainsChange = this.$parse(this.attributes.onDomainsChange);

        callbacks.push((domains, {isEndEvent}) => {
          if (isEndEvent) {
            onDomainsChange(this.scope.$parent, {$domains: domains});
          }
        });
      }

      if (!!this.attributes.domainsSyncKey) {
        this.unregisteringFunctions.push(
          this.scope.$root.$on(this.attributes.domainsSyncKey, (event, domains:Utils.IDomains, type) => {
            if (event.targetScope === this.scope) {
              return;
            }

            if (!domains.x || !domains.y || !domains.x2 || !domains.y2) {
              domains = angular.copy(domains);
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
              eventMgr.trigger('outer-world-domain-change', domains);
              this.factoryMgr.turnFactoriesOn(['tooltip']);

            } else if (type === 'zoom') {
              this.factoryMgr.turnFactoriesOff(['tooltip']);

            } else if (type === 'pan' || type === 'pan-end') {
              this.factoryMgr.turnFactoriesOff(['transitions', 'tooltip']);
              eventMgr.trigger('outer-world-domain-change', domains);

              if (type === 'pan-end') {
                this.factoryMgr.turnFactoriesOn(['transitions', 'tooltip']);
              }

            } else if (type === 'zoom-pan-reset') {
              eventMgr.trigger('zoom-pan-reset', false);
            }
          })
        );

        callbacks.push((domains:Utils.IDomains, {type}) => {
          this.scope.$emit(this.attributes.domainsSyncKey, domains, type);
        });
      }

      let getDomains = ():Utils.IDomains => {
        return {
          x: xAxis.getScaleDomain(),
          x2: x2Axis.getScaleDomain(),
          y: <number[]>yAxis.getScaleDomain(),
          y2: <number[]>y2Axis.getScaleDomain()
        };
      };
      let ping = (domains, args) => callbacks.forEach(fn => fn(domains, args));

      eventMgr.on('pan.sync-layer', () => {
        let domains = getDomains();
        (<Factory.Pan>this.factoryMgr.get('pan')).constrainDomains(domains);
        ping(domains, {type: 'pan'});
      });

      eventMgr.on('pan-end.sync-layer', () => {
        let domains = getDomains();
        (<Factory.Pan>this.factoryMgr.get('pan')).constrainDomains(domains);
        ping(domains, {type: 'pan-end', isEndEvent: true});
      });

      eventMgr.on('zoom.sync-layer', () => {
        let domains = getDomains();
        (<Factory.Zoom>this.factoryMgr.get('zoom')).constrainOutgoingDomains(domains);
        ping(domains, {type: 'zoom', isEndEvent: false});
      });

      eventMgr.on('zoom-end.sync-layer', () => {
        let domains = getDomains();
        (<Factory.Zoom>this.factoryMgr.get('zoom')).constrainOutgoingDomains(domains);
        ping(domains, {type: 'zoom-end', isEndEvent: true});
      });

      eventMgr.on('zoom-pan-reset.sync-layer', (madeHere) => {
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
