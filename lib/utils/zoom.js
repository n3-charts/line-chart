activateZoom: function(element, svg, axes, dimensions, columnWidth) {
  var y2Scale_old = axes.y2Scale;
  var y2Scale = y2Scale_old ? y2Scale_old.copy() : undefined;
  var that = this;

  var onZoom = function() {
    var b = behavior;

    if (y2Scale_old) {
      y2Scale.domain(y2Scale_old.range().map(function(y) { return (y - b.translate()[1]) / b.scale(); }).map(y2Scale_old.invert));
      svg.select('.y2.axis').call(axes.y2Axis.scale(y2Scale));
    }

    svg.select('.x.axis').call(axes.xAxis);
    svg.select('.y.axis').call(axes.yAxis);

    that
      .updateAreas(svg, {xScale: b.x(), yScale: b.y(), y2Scale: y2Scale})
      .updateColumns(svg, {xScale: b.x(), yScale: b.y(), y2Scale: y2Scale}, b.scale() * columnWidth)
      .updateLines(svg, {xScale: b.x(), yScale: b.y(), y2Scale: y2Scale})
      .updateDots(svg, {xScale: b.x(), yScale: b.y(), y2Scale: y2Scale})
    ;
  };

  var behavior = d3.behavior.zoom()
    .x(axes.xScale)
    .y(axes.yScale)
    .on("zoom", onZoom);

  d3.select(element)
    .attr('tabindex', '0')
    .style('outline', '0px solid transparent')
    .on('mouseover', function() {
      d3.event.currentTarget.focus();
    })
    .on('mouseout', function() {
      d3.event.currentTarget.blur();
    })
    .on('keydown', function() {
      if (d3.event.shiftKey) {
        svg.append("svg:rect")
          .attr({
            'id': 'zoomPane',
            "class": "pane",
            "width": dimensions.width,
            "height": dimensions.height,
          })
          .call(behavior);
      }
    })
    .on('keyup', function() {
      svg.selectAll('#zoomPane').remove();
    });
}