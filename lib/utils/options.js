getDefaultOptions: function() {
  return {
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

  if (!options.series) {
    options.series = [];
  }

  if (!options.axes) {
    options.axes = {x: {type: 'linear'}, y: {type: 'linear'}};
  }
  
  options.axes.x = this.sanitizeAxisOptions(options.axes.x);
  options.axes.y = this.sanitizeAxisOptions(options.axes.y);
  
  if (this.haveSecondYAxis(options.series)) {
    options.axes.y2 = this.sanitizeAxisOptions(options.axes.y2);
  }

  if (!options.lineMode) {
    options.lineMode = 'linear';
  }

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