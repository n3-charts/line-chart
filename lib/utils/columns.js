getBestColumnWidth: function(dimensions, data) {
  if (!data || data.length === 0) {
    return 10;
  }

  var n = data[0].values.length + 2; // +2 because abscissas will be extended
                                     // to one more row at each end
  var seriesCount = data.length;
  var gap = 0; // space between two rows
  var avWidth = dimensions.width - dimensions.left - dimensions.right;

  return parseInt(Math.max((avWidth - (n - 1)*gap) / (n*seriesCount), 5));
},

drawColumns: function(svg, axes, data, columnWidth) {
  data = data.filter(function(s) {return s.type === 'column';});

  var x1 = d3.scale.ordinal()
    .domain(data.map(function(s) {return s.name;}))
    .rangeRoundBands([0, data.length * columnWidth], 0.05);

  var that = this;

  var colGroup = svg.select('.content').selectAll('.columnGroup')
    .data(data)
    .enter().append("g")
      .attr('class', function(s) {
        return 'columnGroup ' + 'series_' + s.index;
      })
      .style("fill", function(s) {return s.color;})
      .style("fill-opacity", 0.8)
      .attr("transform", function(series) {
        return "translate(" + (
          x1(series.name) - data.length*columnWidth/2
        ) + ",0)";
      })
      .on('mouseover', function(series) {
        var target = d3.select(d3.event.target);

        that.onMouseOver(svg, {
          series: series,
          x: target.attr('x'),
          y: axes[series.axis + 'Scale'](target.datum().value),
          datum: target.datum()
        });
      })
      .on('mouseout', function(d) {
        d3.select(d3.event.target).attr('r', 2);
        that.onMouseOut(svg);
      });

  colGroup.selectAll("rect")
    .data(function(d) {return d.values;})
    .enter().append("rect")
      .attr("width", columnWidth)
      .attr("x", function(d) {return axes.xScale(d.x);})

      .attr("y", function(d) {
        return axes[d.axis + 'Scale'](Math.max(0, d.value));
      })

      .attr("height", function(d) {
        return Math.abs(axes[d.axis + 'Scale'](d.value) -
          axes[d.axis + 'Scale'](0));
      });

  return this;
},

updateColumns: function(svg, scales, columnWidth) {
  svg.select('.content').selectAll('.columnGroup').selectAll('rect')
    .attr('width', columnWidth)
    .attr("x", function(d) {return scales.xScale(d.x);})
    .attr("y", function(d) {
      return scales[d.axis + 'Scale'](Math.max(0, d.value));
    })
    .attr("height", function(d) {
      return Math.abs(scales[d.axis + 'Scale'](d.value) -
        scales[d.axis + 'Scale'](0));
    });

  return this;
}