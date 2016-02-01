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
      let callbacks:{({translate: [], isEndEvent: Boolean})}[] = [];

      let xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      let yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      if (!!this.attributes.onDrag) {
        var onDrag = this.$parse(this.attributes.onDrag);

        callbacks.push(({translate, isEndEvent}) => {
          if (!isEndEvent) {
            onDrag(this.scope.$parent, {
              $domains: {x: xAxis.getScaleDomain(), y: yAxis.getScaleDomain()}
            });
          }
        });
      }

      if (!!this.attributes.onDragEnd) {
        var onDragEnd = this.$parse(this.attributes.onDragEnd);

        callbacks.push(({translate, isEndEvent}) => {
          if (isEndEvent) {
            onDragEnd(this.scope.$parent, {
              $domains: {x: xAxis.getScaleDomain(), y: yAxis.getScaleDomain()}
            });
          }
        });
      }

      if (!!this.attributes.dragSyncKey) {
         callbacks.push((translate) => {
           this.scope.$emit(this.attributes.dragSyncKey, translate);
         });
      }

      if (callbacks.length > 0) {
        this.unregisteringFunctions.push(
          this.scope.$root.$on(this.attributes.dragSyncKey, (event, {translate, isEndEvent}) => {
            if (event.targetScope === this.scope) {
              return;
            }

            if (isEndEvent) {
              eventMgr.triggerDataAndOptions('outer-world-zoomend', translate);
            } else {
              eventMgr.triggerDataAndOptions('outer-world-zoom', translate);
            }
          })
        );

        eventMgr.on('zoom.directive', (event, bubble) => {
          if (bubble) {
            callbacks.forEach((fn) => fn({translate: event.translate, isEndEvent: false}));
          }
        });

        eventMgr.on('zoomend.directive', (event) => {
          callbacks.forEach((fn) => fn({translate: event.translate, isEndEvent: true}));
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
