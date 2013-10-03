getDefaultOptions: function() {
  return {
    lineMode: 'linear',
    axes: {
      x: {type: 'linear'},
      y: {}
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
    options.axes = {x: {type: 'linear'}, y: {}};
  }

  if (!options.axes.y) {
    options.axes.y = {};
  }

  if (!options.axes.x) {
    options.axes.x = {type: 'linear'};
  }

  if (!options.axes.x.type) {
    options.axes.x.type = 'linear';
  }

  if (!options.lineMode) {
    options.lineMode = 'linear';
  }

  if (this.haveSecondYAxis(options.series)) {
    options.axes.y2 = {};
  }

  return options;
}