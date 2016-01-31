module n3Charts.Factory {
  'use strict';

  export class SyncLayer extends Factory.BaseFactory {

    private unregisteringFunctions: Function[];

    constructor(private scope: ng.IScope, private attributes: any, private $parse: ng.IParseService) {
      super();
    }

    create() {
      this.unregisteringFunctions = [];

      this.sanitizeAttributes();
      this.syncTooltips();
      this.syncDrag();
    }

    sanitizeAttributes() {
      let {tooltipSyncKey, dragSyncKey} = this.attributes;
      if (!!tooltipSyncKey && !!dragSyncKey) {
        if (tooltipSyncKey === dragSyncKey) {
          throw new Error('Heterogeneous sync keys can\'t have the same value.');
        }
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

        eventMgr.on('container-move.directive', (event) => {
          this.scope.$emit(
            this.attributes.tooltipSyncKey,
            this.factoryMgr.get('container').getCoordinatesFromEvent(event)
          );
        });

        eventMgr.on('container-out.directive', () => {
          this.scope.$emit(this.attributes.tooltipSyncKey, { x: undefined, y: undefined });
        });
      }
    }

    syncDrag() {
      let eventMgr: Utils.EventManager = this.eventMgr;
      let callbacks = [];

      if (!!this.attributes.onDrag) {
        let fn = this.$parse(this.attributes.onDrag);
        let xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
        let yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

        callbacks.push((translate) => {
          fn(this.scope.$parent, {
            $domains: {
              x: xAxis.getScaleDomain(),
              y: yAxis.getScaleDomain()
            }
          });
        });
      }

      if (!!this.attributes.dragSyncKey) {
         callbacks.push((translate) => {
           this.scope.$emit(this.attributes.dragSyncKey, translate);
         });
      }

      if (callbacks.length > 0) {
        this.unregisteringFunctions.push(
          this.scope.$root.$on(this.attributes.dragSyncKey, (event, translate) => {
            eventMgr.triggerDataAndOptions('outer-world-zoom', translate);
          })
        );

        eventMgr.on('zoom.directive', (event, bubble) => {
          if (bubble) {
            callbacks.forEach((fn) => fn(event.translate));
          }
        });
      }
    }

    destroy() {
      var fn;
      while (fn = this.unregisteringFunctions.pop()) {
        fn();
      }
    }
  }
}
