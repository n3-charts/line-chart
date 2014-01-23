getPixelCssProp: function(element, propertyName) {
  var string = $window.getComputedStyle(element, null).getPropertyValue(propertyName);
  return +string.replace(/px$/, '');
},

getDefaultMargins: function() {
  return {top: 20, right: 50, bottom: 60, left: 50};
},

clean: function(element) {
  d3.select(element)
    .on('keydown', null)
    .on('keyup', null)
    .select('svg')
      .remove();
},

bootstrap: function(element, dimensions) {
  d3.select(element).classed('chart', true);

  var width = dimensions.width;
  var height = dimensions.height;

  var svg = d3.select(element).append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
      .attr('transform', 'translate(' + dimensions.left +
        ',' + dimensions.top + ')'
      );

  svg.append('defs')
    .attr('class', 'patterns');

  return svg;
},

createContent: function(svg) {
  svg.append('g')
    .attr('class', 'content')
    .attr('clip-path', 'url(#clip)')
  ;
  
},

createClippingPath: function(svg, dimensions) {
  svg.append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
    .attr("width", dimensions.width - dimensions.left - dimensions.right)
    .attr("height", dimensions.height - dimensions.top - dimensions.bottom);
},

getDataPerSeries: function(data, options) {
  var series = options.series;
  var axes = options.axes;

  if (!series || !series.length || !data || !data.length) {
    return [];
  }

  var straightenedData = [];

  series.forEach(function(s) {
    var seriesData = {
      xFormatter: axes.x.tooltipFormatter,
      index: straightenedData.length,
      name: s.y,
      values: [],
      striped: s.striped === true ? true: undefined,
      color: s.color,
      axis: s.axis || 'y',
      type: s.type || 'line'
    };

    data.forEach(function(row) {
      seriesData.values.push({
        x: row[options.axes.x.key],
        value: row[s.y],
        axis: s.axis || 'y'
      });
    });

    straightenedData.push(seriesData);
  });

  return straightenedData;
},

resetMargins: function(dimensions) {
  var defaults = this.getDefaultMargins();

  dimensions.left = defaults.left;
  dimensions.right = defaults.right;
  dimensions.top = defaults.top;
  dimensions.bottom = defaults.bottom;
},

adjustMargins: function(dimensions, options, data) {
  this.resetMargins(dimensions);

  if (!data || data.length === 0) {
    return;
  }

  var series = options.series;

  var leftSeries = series.filter(function(s) { return s.axis !== 'y2'; });
  var leftWidest = this.getWidestOrdinate(data, leftSeries);
  dimensions.left = this.getTextWidth('' + leftWidest) + 20;

  var rightSeries = series.filter(function(s) { return s.axis === 'y2'; });
  if (rightSeries.length === 0) {
    return;
  }
  var rightWidest = this.getWidestOrdinate(data, rightSeries);
  dimensions.right = this.getTextWidth('' + rightWidest) + 20;
},

adjustMarginsForThumbnail: function(dimensions, axes) {
  dimensions.top = 1;
  dimensions.bottom = 2;
  dimensions.left = 0;
  dimensions.right = 1;
},

getTextWidth: function(text) {
  // return Math.max(25, text.length*6.7);
  return parseInt(text.length*5) + 10;
},

getWidestOrdinate: function(data, series) {
  var widest = '';

  data.forEach(function(row) {
    series.forEach(function(series) {
      if (('' + row[series.y]).length > ('' + widest).length) {
        widest = row[series.y];
      }
    });
  });

  return widest;
}