drawDots: function(svg, axes, data) {
  var that = this;

  svg.select('.content').selectAll('.dotGroup')
    .data(data.filter(function(s) { return s.type === 'line' || s.type === 'area'; }))
    .enter().append('g')
      .attr('class', function(s) {
        return 'dotGroup ' + 'series_' + s.index;
      })
      .attr('fill', function(s) {return s.color;})
      .on('mouseover', function(series) {
        var target = d3.select(d3.event.target);
        target.attr('r', 4);

        that.onMouseOver(svg, {
          series: series,
          x: target.attr('cx'),
          y: target.attr('cy'),
          datum: target.datum()
        });
      })
      .on('mouseout', function(d) {
        d3.select(d3.event.target).attr('r', 2);
        that.onMouseOut(svg);
      })
      .selectAll('.dot').data(function(d) {return d.values;})
        .enter().append('circle')
        .attr({
          'class': 'dot',
          'r': 2,
          'cx': function(d) { return axes.xScale(d.x); },
          'cy': function(d) { return axes[d.axis + 'Scale'](d.value); }
        })
        .style({
          'stroke': 'white',
          'stroke-width': '2px'
        });

  return this;
},

updateDots: function(svg, scales) {
  svg.select('.content').selectAll('.dotGroup').selectAll('.dot')
    .attr({
      'cx': function(d) { return scales.xScale(d.x); },
      'cy': function(d) { return scales[d.axis + 'Scale'](d.value); }
    });

    return this;
}
