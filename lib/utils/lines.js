drawLines: function(svg, scales, data, interpolateMode) {
  var drawers = {
    y: this.createLeftLineDrawer(scales, interpolateMode),
    y2: this.createRightLineDrawer(scales, interpolateMode)
  };

  svg.select('.content').selectAll('.lineGroup')
    .data(data.filter(function(s) { return s.type === 'line'  || s.type === 'area'; }))
    .enter().append('g')
      .style('stroke', function(serie) {return serie.color;})
      .attr('class', function(s) {
        return 'lineGroup ' + 'series_' + s.index;
      })
      .append('path')
        .attr('class', 'line')
        .attr('d', function(d) {return drawers[d.axis](d.values);})
        .style({
          'fill': 'none',
          'stroke-width': '1px'
        });

  return this;
},

updateLines: function(svg, scales, interpolateMode) {
  var drawers = {
    y: this.createLeftLineDrawer(scales, interpolateMode),
    y2: this.createRightLineDrawer(scales, interpolateMode)
  };

  svg.select('.content').selectAll('.lineGroup').selectAll('path')
    .attr('d', function(d) {return drawers[d.axis](d.values);});

  return this;
},

createLeftLineDrawer: function(scales, interpolateMode) {
  return d3.svg.line()
    .x(function(d) {return scales.xScale(d.x);})
    .y(function(d) {return scales.yScale(d.value);})
    .interpolate(interpolateMode);
},

createRightLineDrawer: function(scales, interpolateMode) {
  return d3.svg.line()
    .x(function(d) {return scales.xScale(d.x);})
    .y(function(d) {return scales.y2Scale(d.value);})
    .interpolate(interpolateMode);
}