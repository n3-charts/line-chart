(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ({
    getDefaultOptions: function() {
      return {
        tooltip: {
          mode: 'scrubber'
        },
        lineMode: 'linear',
        tension: 0.7,
        margin: this.getDefaultMargins(),
        axes: {
          x: {
            type: 'linear',
            key: 'x'
          },
          y: {
            type: 'linear'
          }
        },
        series: [],
        drawLegend: true,
        drawDots: true,
        stacks: [],
        columnsHGap: 5,
        hideOverflow: false
      };
    },
    sanitizeOptions: function(options, mode) {
      var defaultMargin;
      if (options == null) {
        options = {};
      }
      if (mode === 'thumbnail') {
        options.drawLegend = false;
        options.drawDots = false;
        options.tooltip = {
          mode: 'none',
          interpolate: false
        };
      }
      options.series = this.sanitizeSeriesOptions(options.series);
      options.stacks = this.sanitizeSeriesStacks(options.stacks, options.series);
      options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series));
      options.tooltip = this.sanitizeTooltip(options.tooltip);
      options.margin = this.sanitizeMargins(options.margin);
      options.lineMode || (options.lineMode = this.getDefaultOptions().lineMode);
      options.tension = /^\d+(\.\d+)?$/.test(options.tension) ? options.tension : this.getDefaultOptions().tension;
      options.drawLegend = options.drawLegend !== false;
      options.drawDots = options.drawDots !== false;
      if (!angular.isNumber(options.columnsHGap)) {
        options.columnsHGap = 5;
      }
      options.hideOverflow = options.hideOverflow || false;
      defaultMargin = mode === 'thumbnail' ? this.getDefaultThumbnailMargins() : this.getDefaultMargins();
      options.series = angular.extend(this.getDefaultOptions().series, options.series);
      options.axes = angular.extend(this.getDefaultOptions().axes, options.axes);
      options.tooltip = angular.extend(this.getDefaultOptions().tooltip, options.tooltip);
      options.margin = angular.extend(defaultMargin, options.margin);
      return options;
    },
    sanitizeMargins: function(options) {
      var attrs, margin, opt, value;
      attrs = ['top', 'right', 'bottom', 'left'];
      margin = {};
      for (opt in options) {
        value = options[opt];
        if (!options.hasOwnProperty(opt)) {
          continue;
        }
        if (__indexOf.call(attrs, opt) >= 0) {
          margin[opt] = parseFloat(value);
        }
      }
      return margin;
    },
    sanitizeSeriesStacks: function(stacks, series) {
      var seriesKeys;
      if (stacks == null) {
        return [];
      }
      seriesKeys = {};
      series.forEach(function(s) {
        return seriesKeys[s.id] = s;
      });
      stacks.forEach(function(stack) {
        return stack.series.forEach(function(id) {
          var s;
          s = seriesKeys[id];
          if (s != null) {
            if (s.axis !== stack.axis) {
              return $log.warn("Series " + id + " is not on the same axis as its stack");
            }
          } else {
            if (!s) {
              return $log.warn("Unknown series found in stack : " + id);
            }
          }
        });
      });
      return stacks;
    },
    sanitizeTooltip: function(options) {
      var _ref;
      if (!options) {
        return {
          mode: 'scrubber'
        };
      }
      if ((_ref = options.mode) !== 'none' && _ref !== 'axes' && _ref !== 'scrubber') {
        options.mode = 'scrubber';
      }
      if (options.mode === 'scrubber') {
        delete options.interpolate;
      } else {
        options.interpolate = !!options.interpolate;
      }
      if (options.mode === 'scrubber' && options.interpolate) {
        throw new Error('Interpolation is not supported for scrubber tooltip mode.');
      }
      return options;
    },
    sanitizeSeriesOptions: function(options) {
      var colors, knownIds;
      if (options == null) {
        return [];
      }
      colors = d3.scale.category10();
      knownIds = {};
      options.forEach(function(s, i) {
        if (knownIds[s.id] != null) {
          throw new Error("Twice the same ID (" + s.id + ") ? Really ?");
        }
        if (s.id != null) {
          return knownIds[s.id] = s;
        }
      });
      options.forEach(function(s, i) {
        var cnt, _ref, _ref1, _ref2, _ref3;
        s.axis = ((_ref = s.axis) != null ? _ref.toLowerCase() : void 0) !== 'y2' ? 'y' : 'y2';
        s.color || (s.color = colors(i));
        s.type = (_ref1 = s.type) === 'line' || _ref1 === 'area' || _ref1 === 'column' ? s.type : "line";
        if (s.type === 'column') {
          delete s.thickness;
          delete s.lineMode;
          delete s.drawDots;
          delete s.dotSize;
        } else if (!/^\d+px$/.test(s.thickness)) {
          s.thickness = '1px';
        }
        if ((_ref2 = s.type) === 'line' || _ref2 === 'area') {
          if ((_ref3 = s.lineMode) !== 'dashed') {
            delete s.lineMode;
          }
          if (s.drawDots !== false && (s.dotSize == null)) {
            s.dotSize = 2;
          }
        }
        if (s.id == null) {
          cnt = 0;
          while (knownIds["series_" + cnt] != null) {
            cnt++;
          }
          s.id = "series_" + cnt;
          knownIds[s.id] = s;
        }
        if (s.drawDots === false) {
          return delete s.dotSize;
        }
      });
      return options;
    },
    sanitizeAxes: function(axesOptions, secondAxis) {
      var _base;
      if (axesOptions == null) {
        axesOptions = {};
      }
      axesOptions.x = this.sanitizeAxisOptions(axesOptions.x);
      (_base = axesOptions.x).key || (_base.key = "x");
      axesOptions.y = this.sanitizeAxisOptions(axesOptions.y);
      if (secondAxis) {
        axesOptions.y2 = this.sanitizeAxisOptions(axesOptions.y2);
      }
      return axesOptions;
    },
    sanitizeExtrema: function(axisOptions) {
      var extremum, originalValue, _i, _len, _ref, _results;
      _ref = ['min', 'max'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        extremum = _ref[_i];
        originalValue = axisOptions[extremum];
        if (originalValue != null) {
          axisOptions[extremum] = this.sanitizeExtremum(extremum, axisOptions);
          if (axisOptions[extremum] == null) {
            _results.push($log.warn("Invalid " + extremum + " value '" + originalValue + "' (parsed as " + axisOptions[extremum] + "), ignoring it."));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    sanitizeExtremum: function(name, axisOptions) {
      var sanitizer;
      sanitizer = this.sanitizeNumber;
      if (axisOptions.type === 'date') {
        sanitizer = this.sanitizeDate;
      }
      return sanitizer(axisOptions[name]);
    },
    sanitizeDate: function(value) {
      if (value == null) {
        return void 0;
      }
      if (!(value instanceof Date) || isNaN(value.valueOf())) {
        return void 0;
      }
      return value;
    },
    sanitizeNumber: function(value) {
      var number;
      if (value == null) {
        return void 0;
      }
      number = parseFloat(value);
      if (isNaN(number)) {
        return void 0;
      }
      return number;
    },
    sanitizeAxisOptions: function(options) {
      if (options == null) {
        return {
          type: 'linear'
        };
      }
      options.type || (options.type = 'linear');
      if (options.ticksRotate != null) {
        options.ticksRotate = this.sanitizeNumber(options.ticksRotate);
      }
      if (options.zoomable != null) {
        options.zoomable = options.zoomable || false;
      }
      if (options.innerTicks != null) {
        options.innerTicks = options.innerTicks || false;
      }
      if (options.labelFunction != null) {
        options.ticksFormatter = options.labelFunction;
      }
      if (options.ticksFormat != null) {
        if (options.type === 'date') {
          options.ticksFormatter = d3.time.format(options.ticksFormat);
        } else {
          options.ticksFormatter = d3.format(options.ticksFormat);
        }
        if (options.tooltipFormatter == null) {
          options.tooltipFormatter = options.ticksFormatter;
        }
      }
      if (options.tooltipFormat != null) {
        if (options.type === 'date') {
          options.tooltipFormatter = d3.time.format(options.tooltipFormat);
        } else {
          options.tooltipFormatter = d3.format(options.tooltipFormat);
        }
      }
      if (options.ticksInterval != null) {
        options.ticksInterval = this.sanitizeNumber(options.ticksInterval);
      }
      this.sanitizeExtrema(options);
      return options;
    }
  });

}).call(this);

//# sourceMappingURL=options.js.map
