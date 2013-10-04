getDefaultOptions: function() {
  return {
    tooltipMode: 'default',
    lineMode: 'linear',
    axes: {
      x: {type: 'linear'},
      y: {type: 'linear'}
    },
    series: []
  };
},

sanitizeOptions: function(options) {
  if (options === null || options === undefined) {
    return this.getDefaultOptions();
  }
  
  options.series = this.sanitizeSeriesOptions(options.series);

  options.axes = options.axes ? options.axes : {};
  options.axes.x = this.sanitizeAxisOptions(options.axes.x);
  options.axes.y = this.sanitizeAxisOptions(options.axes.y);
  if (this.haveSecondYAxis(options.series)) {
    options.axes.y2 = this.sanitizeAxisOptions(options.axes.y2);
  }
  
  options.lineMode = options.lineMode ? options.lineMode : 'linear';
  options.tooltipMode = options.tooltipMode ? options.tooltipMode : 'default';

  return options;
},

sanitizeSeriesOptions: function(options) {
  if (!options) {
    return [];
  }
  
  var colors = d3.scale.category10();
  options.forEach(function(s, i) {
    s.color = s.color ? s.color : colors(i)
  });
  
  return options;
},

sanitizeAxisOptions: function(options) {
  if (!options) {
    return {type: 'linear'};
  }
  
  if (!options.type) {
    options.type = 'linear';
  }
  
  return options;
}