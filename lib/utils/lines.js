drawLines: function(svg, scales, data, options) {
  var drawers = {
    y: this.createLeftLineDrawer(scales, options.lineMode, options.tension),
    y2: this.createRightLineDrawer(scales, options.lineMode, options.tension)
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
          'stroke-width': function(s) {return s.thickness;}
        });

  return this;
},

createLeftLineDrawer: function(scales, mode, tension) {
  return d3.svg.line()
    .x(function(d) {return scales.xScale(d.x);})
    .y(function(d) {return scales.yScale(d.value);})
    .interpolate(mode)
    .tension(tension);
},

createRightLineDrawer: function(scales, mode, tension) {
  return d3.svg.line()
    .x(function(d) {return scales.xScale(d.x);})
    .y(function(d) {return scales.y2Scale(d.value);})
    .interpolate(mode)
    .tension(tension);
}
