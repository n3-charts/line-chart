drawArea: function(svg, scales, data, interpolateMode){
  var drawers = {
    y: this.createLeftAreaDrawer(scales, interpolateMode),
    y2: this.createRightAreaDrawer(scales, interpolateMode)
  };

  svg.select('.content').selectAll('.areaGroup')
    .data(data.filter(function(series) { return series.type === 'area'; }))
    .enter().append('g')
      .style('fill', function(serie) { return serie.color; })
      .attr('class', function(s) {
        return 'areaGroup ' + 'series_' + s.index;
      })
      .append('path')
        .attr('class', 'area')
        .style('opacity', '0.3')
        .attr('d',  function(d) { return drawers[d.axis](d.values); });

  return this;
},

updateAreas: function(svg, scales, interpolateMode) {
  var drawers = {
    y: this.createLeftAreaDrawer(scales, interpolateMode),
    y2: this.createRightAreaDrawer(scales, interpolateMode)
  };

  svg.select('.content').selectAll('.areaGroup').selectAll('path')
    .attr('d', function(d) {return drawers[d.axis](d.values);});

  return this;
},

createLeftAreaDrawer: function(scales, interpolateMode) {
  return d3.svg.area()
    .x(function(d) { return scales.xScale(d.x); })
    .y0(function(d) { return scales.yScale(0); })
    .y1(function(d) { return scales.yScale(d.value); })
    .interpolate(interpolateMode);
},

createRightAreaDrawer: function(scales, interpolateMode) {
  return d3.svg.area()
    .x(function(d) { return scales.xScale(d.x); })
    .y0(function(d) { return scales.y2Scale(0); })
    .y1(function(d) { return scales.y2Scale(d.value); })
    .interpolate(interpolateMode);
}