getDefaultOptions: function() {
  return {
    tooltipMode: 'default',
    lineMode: 'linear',
    axes: {
      x: {type: 'linear', key: 'x'},
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

  options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series));
  
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

sanitizeAxes: function(axesOptions, secondAxis) {
  if (!axesOptions) {
    axesOptions = {};
  }
  
  axesOptions.x = this.sanitizeAxisOptions(axesOptions.x);
  if (!axesOptions.x.key) {
    axesOptions.x.key = "x";
  }
  
  axesOptions.y = this.sanitizeAxisOptions(axesOptions.y);
  
  if (secondAxis) {
    axesOptions.y2 = this.sanitizeAxisOptions(axesOptions.y2);
  }
  
  return axesOptions;
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