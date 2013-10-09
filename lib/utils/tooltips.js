addTooltips: function (svg, dimensions, axesOptions) {
  var width = dimensions.width;
  var height = dimensions.height;

  width = width - dimensions.left - dimensions.right;
  height = height - dimensions.top - dimensions.bottom;
  
  var w = 24;
  var h = 18;
  var p = 5;

  var xTooltip = svg.append('g')
    .attr({
      'id': 'xTooltip',
      'opacity': 0
    });

  xTooltip.append('path')
    .attr({
      'transform': 'translate(0,' + (height + 1) + ')'
    });

  xTooltip.append('text')
    .style({
      'text-anchor': 'middle'
    })
    .attr({
      'width': w,
      'height': h,
      'font-family': 'monospace',
      'font-size': 10,
      'transform': 'translate(0,' + (height + 19) + ')',
      'fill': 'white',
      'text-rendering': 'geometric-precision'
    });

  var yTooltip = svg.append('g')
    .attr({
      'id': 'yTooltip',
      'opacity': 0
    });

  yTooltip.append('path');
  yTooltip.append('text')
    .attr({
      'width': h,
      'height': w,
      'font-family': 'monospace',
      'font-size': 10,
      'fill': 'white',
      'text-rendering': 'geometric-precision'
    });

  if (axesOptions.y2 !== undefined) {
    var y2Tooltip = svg.append('g')
      .attr({
        'id': 'y2Tooltip',
        'opacity': 0,
        'transform': 'translate(' + width + ',0)'
      });

    y2Tooltip.append('path');

    y2Tooltip.append('text')
      .attr({
        'width': h,
        'height': w,
        'font-family': 'monospace',
        'font-size': 10,
        'fill': 'white',
        'text-rendering': 'geometric-precision'
      });
  }
},

onMouseOver: function(svg, target) {
  this.updateXTooltip(svg, target);

  if (target.series.axis === 'y2') {
    this.updateY2Tooltip(svg, target);
  } else {
    this.updateYTooltip(svg, target);
  }
},

onMouseOut: function(svg) {
  this.hideTooltips(svg);
},

updateXTooltip: function(svg, target) {
  var xTooltip = svg.select("#xTooltip")
    .transition()
    .attr({
      'opacity': 1.0,
      'transform': 'translate(' + target.x + ',0)'
    });

  var textX;
  if (target.series.xFormatter) {
    textX = '' + target.series.xFormatter(target.datum.x);
  } else {
    textX = '' + target.datum.x;
  }

  xTooltip.select('text').text(textX);
  xTooltip.select('path')
    .attr('fill', target.series.color)
    .attr('d', this.getXTooltipPath(textX));
},

getXTooltipPath: function(text) {
  var w = this.getTextWidth(text);
  var h = 18;
  var p = 5; // Size of the 'arrow' that points towards the axis

  return 'm-' + w/2 + ' ' + p + ' ' +
    'l0 ' + h + ' ' +
    'l' + w + ' 0 ' +
    'l0 ' + '-' + h +
    'l-' + (w/2 - p) + ' 0 ' +
    'l-' + p + ' -' + h/4 + ' ' +
    'l-' + p + ' ' + h/4 + ' ' +
    'l-' + (w/2 - p) + ' 0z';
},

updateYTooltip: function(svg, target) {
  var yTooltip = svg.select("#yTooltip")
    .transition()
    .attr({
      'opacity': 1.0,
      'transform': 'translate(0, ' + target.y + ')'
    });

  var textY = '' + target.datum.value;
  var w = this.getTextWidth(textY);
  var yTooltipText = yTooltip.select('text').text(textY);
  
  yTooltipText.attr({
    'transform': 'translate(' + (- w - 2) + ',3)',
    'width': w
  }).select('path')
    .attr('fill', target.series.color)
    .attr('d', this.getYTooltipPath(textY));
},

getYTooltipPath: function(text) {
  var w = this.getTextWidth(text);
  var h = 18;
  var p = 5; // Size of the 'arrow' that points towards the axis

  return 'm0 0' +
    'l-' + p + ' -' + p + ' ' +
    'l0 -' + (h/2 - p) + ' ' +
    'l-' + w + ' 0 ' +
    'l0 ' + h + ' ' +
    'l' + w + ' 0 ' +
    'l0 -' + (h/2 - p) +
    'l-' + p + ' ' + p + 'z';
},

updateY2Tooltip: function(svg, target) {
  var y2Tooltip = svg.select("#y2Tooltip")
    .transition()
    .attr({
      'opacity': 1.0
    });

  var textY = '' + target.datum.value;
  var y2TooltipText = y2Tooltip.select('text').text(textY);
  y2TooltipText.attr(
    'transform',
    'translate(5, ' + (parseFloat(target.y) + 3) + ')'
  );
  y2Tooltip.select('path')
    .attr({
      'fill': target.series.color,
      'd': this.getY2TooltipPath(textY),
      'transform': 'translate(0, ' + target.y + ')'
    });
},

getY2TooltipPath: function(text) {
  var w = this.getTextWidth(text);
  var h = 18;
  var p = 5; // Size of the 'arrow' that points towards the axis

  return 'm0 0' +
    'l' + p + ' ' + p + ' ' +
    'l0 ' + (h/2 - p) + ' ' +
    'l' + w + ' 0 ' +
    'l0 -' + h + ' ' +
    'l-' + w + ' 0 ' +
    'l0 ' + (h/2 - p) + ' ' +
    'l-' + p + ' ' + p + 'z';
},

hideTooltips: function(svg) {
  svg.select("#xTooltip")
    .transition()
    .attr({ 'opacity': 0 });

  svg.select("#yTooltip")
    .transition()
    .attr({'opacity': 0 });

  svg.select("#y2Tooltip")
    .transition()
    .attr({'opacity': 0 });
}