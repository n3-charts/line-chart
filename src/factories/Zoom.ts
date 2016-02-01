module n3Charts.Factory {
  'use strict';

  export class Zoom extends Factory.BaseFactory {

    public behavior: D3.Behavior.Zoom;

    create() {
      this.behavior = d3.behavior.zoom();
      this.eventMgr.on('outer-world-zoom.' + this.key, this.updateFromOuterWorld.bind(this));
    }

    updateFromOuterWorld(translate) {
      this.behavior.translate(translate);

      var xAxis = this.factoryMgr.get('x-axis');
      var yAxis = this.factoryMgr.get('y-axis');
      var y2Axis = this.factoryMgr.get('y2-axis');
      var x2Axis = this.factoryMgr.get('x2-axis');

      y2Axis.scale.domain(yAxis.scale.domain());
      x2Axis.scale.domain(xAxis.scale.domain());

      this.factoryMgr.turnFactoriesOff(['transitions', 'tooltip']);
      this.eventMgr.trigger('zoom', d3.event, false);
      this.factoryMgr.turnFactoriesOn(['transitions', 'tooltip']);
    }

    update(data:Utils.Data, options:Options.Options) {
      var xAxis = this.factoryMgr.get('x-axis');
      var yAxis = this.factoryMgr.get('y-axis');

      if (options.pan.x) {
        this.behavior.x(xAxis.scale);
      }

      if (options.pan.y) {
        this.behavior.y(yAxis.scale);
      }

      if (!options.pan.x && !options.pan.y) {
        return;
      }

      var y2Axis = this.factoryMgr.get('y2-axis');
      var x2Axis = this.factoryMgr.get('x2-axis');
      var eventMgr = this.eventMgr;
      var transitions = this.factoryMgr.get('transitions');

      var throttle = (callback, limit) => {
        let wait = false;
        return (...args) => {
          if (!wait) {
            callback.apply(this, args);
            wait = true;
            setTimeout(function () {
              wait = false;
            }, limit);
          }
        };
      };

      var throttled = throttle(function(event) {
        // This will need to be done better when actually having y2 axes...
        y2Axis.scale.domain(yAxis.scale.domain());
        x2Axis.scale.domain(xAxis.scale.domain());
        eventMgr.trigger('zoom', event, true);
      }, 10);

      this.behavior
        .scaleExtent([1, 1])
        .on('zoomstart', () => {
          this.factoryMgr.turnFactoriesOff(['transitions', 'tooltip']);
        }).on('zoom', () => {
          throttled(d3.event);
        }).on('zoomend', () => {
          this.factoryMgr.turnFactoriesOn(['transitions', 'tooltip']);
          eventMgr.trigger('zoomend', event, true);
        });

      this.factoryMgr.get('container').svg.call(this.behavior);

      // This is to allow scroll, we don't actually care about zoom here,
      // despite the name...
      this.factoryMgr.get('container').svg.on('wheel.zoom', null);
      this.factoryMgr.get('container').svg.on('mousewheel.zoom', null);
    }
  }
}
