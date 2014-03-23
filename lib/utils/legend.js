drawLegend: function(svg, series, dimensions) {
  var layout = [0];

  for (var i = 1; i < series.length; i++) {
    var l = series[i - 1].label || series[i - 1].y;
    layout.push(this.getTextWidth(l) + layout[i - 1] + 40);
  }

  var that = this;
  var legend = svg.append('g').attr('class', 'legend');

  var d = 16;
  svg.select('defs').append('svg:clipPath')
    .attr({
      "id": "legend-clip"
    }).append('circle').attr({'r': d/2});

  var item = legend.selectAll('.legendItem')
    .data(series)
    .enter().append('g')
      .attr({
        'class': 'legendItem',
        'transform': function(s, i) {
          return 'translate(' + layout[i] + ',' + (dimensions.height - 40) + ')';
        }
      });


  item.on('click', function(s, i) {
    d3.select(this).attr('opacity', that.toggleSeries(svg, i) ? '1' : '0.2');
  });

  item.append('circle')
    .attr({
      'fill': function(s) {return s.color;},
      'stroke': function(s) {return s.color;},
      'stroke-width': '2px',
      'r': d/2
    });

  item.append('path')
    .attr({
      'clip-path': "url(#legend-clip)",
      'fill-opacity': function(s) {return (s.type === 'area' || s.type === 'column') ? '1' : '0';},
      'fill': 'white',
      'stroke': 'white',
      'stroke-width': '2px',
      'd': function(s) {return that.getLegendItemPath(s, d, d);}
    })
    ;

  item.append('circle')
    .attr({
      'fill-opacity': 0,
      'stroke': function(s) {return s.color;},
      'stroke-width': '2px',
      'r': d/2
    });


  item.append('text')
    .attr({
      'font-family': 'monospace',
      'font-size': 10,
      'transform': 'translate(13, 4)',
      'text-rendering': 'geometric-precision'
    })
    .text(function(s) {return s.label || s.y;});

  return this;
},

getLegendItemPath: function(series, w, h) {
  if (series.type === 'column') {
    var path = 'M-' + w/3 + ' -' + h/8 + ' l0 ' + h + ' ';
    path += 'M0' + ' -' + h/3 + ' l0 ' + h + ' ';
    path += 'M' +w/3 + ' -' + h/10 + ' l0 ' + h + ' ';

    return path;
  }

  var base_path = 'M-' + w/2 + ' 0' + h/3 + ' l' + w/3 + ' -' + h/3 + ' l' + w/3 + ' ' +  h/3 + ' l' + w/3 + ' -' + 2*h/3;

  if (series.type === 'area') {
    return base_path + ' l0 ' + h + ' l-' + w + ' 0z';
  }

  return base_path;
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
