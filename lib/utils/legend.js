drawLegend: function(svg, series, dimensions) {
  var layout = [0];

  for (var i = 1; i < series.length; i++) {
    var l = series[i - 1].label || series[i - 1].y;
    layout.push(this.getTextWidth(l) + layout[i - 1] + 20);
  }

  var that = this;
  var legend = svg.append('g').attr('class', 'legend');

  var item = legend.selectAll('.legendItem')
    .data(series)
    .enter().append('g')
      .attr({
        'class': 'legendItem',
        'transform': function(s, i) {
          return 'translate(' + layout[i] + ',' + (dimensions.height - 35) + ')';
        }
      });

  item.append('circle')
    .attr({
      'fill': function(s) {return s.color;},
      'r': 4,
      'stroke': function(s) {return s.color;},
      'stroke-width': '2px'
    })
    .on('click', function(s, i) {
      d3.select(this).attr('fill-opacity', that.toggleSeries(svg, i) ? '1' : '0.2');
    })
    ;

  item.append('text')
    .attr({
      'font-family': 'monospace',
      'font-size': 10,
      'transform': 'translate(10, 3)',
      'text-rendering': 'geometric-precision'
    })
    .text(function(s) {return s.label || s.y;});

  return this;
},

toggleSeries: function(svg, index) {
  var isVisible = false;

  svg.select('.content').selectAll('.series_' + index)
    .attr('opacity', function(s) {
      if (d3.select(this).attr('opacity') === '0') {
        isVisible = true;
        return '1';
      }

      isVisible = false;
      return '0';
    });

  return isVisible;
}