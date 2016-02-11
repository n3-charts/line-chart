module n3Charts.svg {
  'use strict';

  export function twoSpeedAxis() {
    var d3_arraySlice = [].slice;
    var d3_array = function(list) { return d3_arraySlice.call(list); };

    var d3_svg_axisDefaultOrient = 'bottom',
      d3_svg_axisOrients = {top: 1, right: 1, bottom: 1, left: 1};

    function d3_svg_axisX(selection, x0, x1) {
      selection.attr('transform', function(d) { var v0 = x0(d.value);
      return 'translate(' + (isFinite(v0) ? v0 : x1(d.value)) + ',0)'; });
    }

    function d3_svg_axisY(selection, y0, y1) {
      selection.attr('transform', function(d) { var v0 = y0(d.value);
      return 'translate(0,' + (isFinite(v0) ? v0 : y1(d.value)) + ')'; });
    }

    function d3_scaleExtent(domain) {
      var start = domain[0], stop = domain[domain.length - 1];
      return start < stop ? [start, stop] : [stop, start];
    }

    function d3_scaleRange(scale) {
      return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
    }

    var scale = d3.scale.linear(),
        orient = d3_svg_axisDefaultOrient,
        outerTickSize = 6,

        innerTickSize = 24,
        tickPadding = -6,

        minorInnerTickSize = 0,
        minorTickPadding = 5,

        ticks = null,
        tickValues = null,
        tickFormat_;

    var tickGenerator = (ticks:{label:string, value: number|Date}[], selector: string, scale0, scale1, g) => {
      let isMajor = selector === 'major';
      let tickSize = isMajor ? innerTickSize : minorInnerTickSize;
      let padding = isMajor ? tickPadding : minorTickPadding;

      let tick = g.selectAll('.tick.' + selector).data(ticks, (d) => scale1(d.value));

      let tickEnter = tick.enter().insert('g', '.domain').attr('class', 'tick ' + selector).style('opacity', 1e-6);

      // d3.transition interface isn't suppose to take any arguments
      // WELL GOOD THING THERE'S A D.TS FILE
      let tickExit = (<any>d3.transition)(tick.exit()).style('opacity', 1e-6).remove();
      let tickUpdate = (<any>d3.transition)(tick.order()).style('opacity', 1);

      let tickSpacing = Math.max(tickSize, 0) + padding;
      let tickTransform;

      // Domain.
      let range = d3_scaleRange(scale1);
      let path = g.selectAll('.domain').data([0]);
      let pathUpdate = (path.enter().append('path').attr('class', 'domain'), path.transition());

      tickEnter.append('line');
      tickEnter.append('text');

      let lineEnter = tickEnter.select('line');
      let lineUpdate = tickUpdate.select('line');
      let text = tick.select('text').text((d, i) => tickFormat_ ? tickFormat_(d, i) : d.label);
      let textEnter = tickEnter.select('text');
      let textUpdate = tickUpdate.select('text');
      let sign = orient === 'top' || orient === 'left' ? -1 : 1;
      let x1, x2, y1, y2;

      if (orient === 'bottom' || orient === 'top') {
        tickTransform = d3_svg_axisX, x1 = 'x', y1 = 'y', x2 = 'x2', y2 = 'y2';
        text.attr({
          'dy': sign < 0 ? '0em' : '.8em',
          'dx': '5px'
        }).style('text-anchor', 'left');

        pathUpdate.attr('d', 'M' + range[0] + ',' + sign * outerTickSize + 'V0H' + range[1] + 'V' + sign * outerTickSize);
      } else {
        tickTransform = d3_svg_axisY, x1 = 'y', y1 = 'x', x2 = 'y2', y2 = 'x2';
        text.attr({
          'dy': '.32em',
          'dx': sign < 0 ? -tickSpacing + 'px' : tickSpacing + 'px'
        }).style('text-anchor', sign < 0 ? 'end' : 'start');
        pathUpdate.attr('d', 'M' + sign * outerTickSize + ',' + range[0] + 'H0V' + range[1] + 'H' + sign * outerTickSize);
      }

      lineEnter.attr(y2, sign * tickSize);
      textEnter.attr(y1, sign * tickSpacing);
      lineUpdate.attr(x2, 0).attr(y2, sign * tickSize);
      textUpdate.attr(x1, 0).attr(y1, sign * tickSpacing);

      tickExit.call(tickTransform, scale1, scale0);

      tickEnter.call(tickTransform, scale0, scale1);
      tickUpdate.call(tickTransform, scale1, scale1);
    };

    var axis:any = function(g) {
      g.each(function() {
        var g = d3.select(this);

        // Stash a snapshot of the new scale, and retrieve the old snapshot.
        let scale0 = this.__chart__ || scale;
        let scale1 = this.__chart__ = scale.copy();

        // Ticks, or domain values for ordinal scales.
        let {major, minor} = ticks(scale1.domain());

        tickGenerator(major, 'major', scale0, scale1, g);
        tickGenerator(minor, 'minor', scale0, scale1, g);
      });
    };

    axis.scale = function(x) {
      if (!arguments.length) {
        return scale;
      }
      scale = x;
      return axis;
    };

    axis.orient = function(x) {
      if (!arguments.length) {
        return orient;
      }
      orient = x in d3_svg_axisOrients ? x + '' : d3_svg_axisDefaultOrient;
      return axis;
    };

    axis.ticks = function(x) {
      if (!arguments.length) {
        return ticks;
      }
      ticks = x;
      return axis;
    };

    axis.tickValues = function(x) {
      if (!arguments.length) {
        return tickValues;
      }
      tickValues = x;
      return axis;
    };

    axis.tickFormat = function(x) {
      if (!arguments.length) {
        return tickFormat_;
      }
      tickFormat_ = x;
      return axis;
    };

    axis.tickSize = function(x) {
      var n = arguments.length;
      if (!n) {
        return innerTickSize;
      }
      innerTickSize = +x;
      outerTickSize = +arguments[n - 1];

      minorInnerTickSize = +x;
      return axis;
    };

    axis.innerTickSize = function(x) {
      if (!arguments.length) {
        return innerTickSize;
      }
      innerTickSize = +x;
      return axis;
    };

    axis.outerTickSize = function(x) {
      if (!arguments.length) {
        return outerTickSize;
      }
      outerTickSize = +x;
      return axis;
    };

    axis.tickPadding = function(x) {
      if (!arguments.length) {
        return tickPadding;
      }
      tickPadding = +x;
      return axis;
    };

    return axis;
  };
}
