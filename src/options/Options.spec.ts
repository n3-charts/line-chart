/// <reference path='../test.spec.ts' />

describe('n3Charts.Options.Options', () => {
  // Type Shortcut
  var Options = n3Charts.Options.Options;
  var SeriesOptions = n3Charts.Options.SeriesOptions;
  var AxisOptions = n3Charts.Options.AxisOptions;
  var Axis = n3Charts.Factory.Axis;
  // Placeholder for module instance
  var options: n3Charts.Options.Options;

  describe('constructor', () => {
    it('should create an instance without arguments', () => {
      options = new Options();

      var testing = options instanceof Options;
      var expected = true;

      expect(testing).toBe(expected);
    });

    it('should create a series property with the type array', () => {
      options = new Options();

      var testing = angular.isArray(options.series);
      var expected = true;

      expect(testing).toBe(expected);
    });

    it('should create a margin property with the type object', () => {
      options = new Options();

      var testing = angular.isObject(options.margin);
      var expected = true;

      expect(testing).toBe(expected);
    });

    it('should create an axes property with the type object', () => {
      options = new Options();

      var testing = angular.isObject(options.axes);
      var expected = true;

      expect(testing).toBe(expected);
    });
  });

  describe('sanitizeOptions', () => {
    beforeEach(() => {
      options = new Options();
    });

    it('should create an array as series property', () => {
      var opt = new Options();

      var testing = angular.isArray(opt.series);
      var expected = true;

      expect(testing).toBe(expected);
    });

    it('should create an object as margin property', () => {
      var opt = new Options();

      var testing = angular.isObject(opt.margin);
      var expected = true;

      expect(testing).toBe(expected);
    });

    it('should throw a type error when margin argument is not an object', () => {
      expect(() => new Options({ margin: 'bar' })).toThrow();
    });

    it('should create an object as axes property', () => {
      var opt = new Options();

      var testing = angular.isObject(opt.axes);
      var expected = true;

      expect(testing).toBe(expected);
    });

    it('should throw a type error when axes argument is not an object', () => {
      expect(() => new Options({ axes: 'bar' })).toThrow();
    });
  });

  describe('sanitizeMargin', () => {
    var arg: any;
    var margin: n3Charts.Options.IMargin;

    beforeEach(() => {
      options = new Options();

      arg = {
        top: '10',
        bottom: '10.09',
        left: 10.5,
        right: undefined
      };

      margin = options.sanitizeMargin(arg);
    });

    it('should parse values as float', () => {
      var testing = margin;
      var expected = {
        top: 10,
        bottom: 10.09,
        left: 10.5,
        right: 0
      };

      expect(testing).toEqual(expected);
    });
  });

  describe('sanitizeSeries', () => {
    var arg: any[];
    var series: n3Charts.Options.ISeriesOptions[];

    beforeEach(() => {
      options = new Options();

      arg = [{
        axis: 'y',
        key: 'val_0'
      }, {
        axis: 'y',
        key: 'val_1'
      }];

      series = options.sanitizeSeries(arg);
    });

    it('should return an array of SeriesOptions instances', () => {
      var testing = series[0] instanceof SeriesOptions;
      var expected = true;

      expect(testing).toBe(expected);
    });
  });

  describe('sanitizeGrid', () => {
    var grid: n3Charts.Options.ITwoAxes;

    describe('behavior', () => {
      beforeEach(() => {
        options = new Options();
        grid = options.sanitizeTwoAxesOptions({}, options.grid);
      });

      it('should have a default', () => {
        var testing = grid;
        var expected = {x: false, y: true};

        expect(testing).toEqual(expected);
      });
    });
  });

  describe('sanitizePanOptions', () => {
    var testIdentityFunction = (fn:any) => {
      var input = [];
      expect(fn(input)).toBe(input);
    };

    var testUndefinedFunction = (fn:any) => {
      var input = [];
      expect(fn(input)).toBe(undefined);
    };

    describe('sanitizePanOption', () => {
      it('should sanitize true', () => {
        let fn = options.sanitizePanOption(true);
        testIdentityFunction(fn);
      });

      it('should sanitize false', () => {
        let fn = options.sanitizePanOption(false);
        testUndefinedFunction(fn);
      });

      it('should sanitize undefined', () => {
        let fn = options.sanitizePanOption(undefined);
        testUndefinedFunction(fn);
      });

      it('should sanitize a function', () => {
        let output = [42];
        let fn = options.sanitizePanOption((whatever) => output);
        expect(fn([1, 2])).toBe(output);
      });

      it('should NOT sanitize yo mama', () => {
        expect(() => options.sanitizePanOption(42)).toThrow();
      });
    });
  });

  describe('sanitizeAxes', () => {
    var axes: n3Charts.Options.IAxesSet;

    describe('behavior', () => {
      beforeEach(() => {
        options = new Options();
        axes = options.sanitizeAxes({
          x: {type: 'linear'},
          y: {}
        });
      });

      it('should return an object containing an AxisOptions instance for the x axis', () => {
        var testing = axes[AxisOptions.SIDE.X] instanceof AxisOptions;
        var expected = true;

        expect(testing).toBe(expected);
      });

      it('should return an object containing an AxisOptions instance for the y axis', () => {
        var testing = axes[AxisOptions.SIDE.Y] instanceof AxisOptions;
        var expected = true;

        expect(testing).toBe(expected);
      });

      it('should assume the axis is linear by default', () => {
        var testing = axes[AxisOptions.SIDE.Y].type;
        var expected = 'linear';

        expect(testing).toBe(expected);
      });
    });

    describe('numeric extrema', () => {
      beforeEach(() => {
        options = new Options();

        axes = options.sanitizeAxes({
          x: {
            type: 'linear'
          },
          y: {
            type: 'linear',
            min: -10,
            max: 10
          }
        });
      });

      it('should detect min', () => {
        var testing = axes[AxisOptions.SIDE.Y].min;
        var expected = -10;

        expect(testing).toBe(expected);
      });

      it('should detect min', () => {
        var testing = axes[AxisOptions.SIDE.Y].max;
        var expected = 10;

        expect(testing).toBe(expected);
      });

      it('should have undefined by default', () => {
        var testing = axes[AxisOptions.SIDE.X].min;
        var expected = undefined;

        expect(testing).toBe(expected);
      });
    });

    describe('date extrema', () => {
      beforeEach(() => {
        options = new Options();

        axes = options.sanitizeAxes({
          x: {
            type: 'date',
            min: new Date(0),
            max: new Date(2)
          },
          y: {
            type: 'linear'
          }
        });
      });

      it('should detect min', () => {
        var testing = axes[AxisOptions.SIDE.X].min;
        var expected = new Date(0);

        expect(testing).toEqual(expected);
      });

      it('should detect min', () => {
        var testing = axes[AxisOptions.SIDE.X].max;
        var expected = new Date(2);

        expect(testing).toEqual(expected);
      });

      it('should have unedfined by default', () => {
        var testing = axes[AxisOptions.SIDE.Y].min;
        var expected = undefined;

        expect(testing).toBe(expected);
      });
    });
  });

  describe('getSeriesByType', () => {
    beforeEach(() => {
      options = new Options({
        series: [
          {
            axis: 'y',
            dataset: 'dataset0',
            key: 'val_0',
            id: 'mySeries_0',
            type: 'line'
          },
          {
            axis: 'y',
            dataset: 'dataset2',
            key: 'val_1',
            id: 'mySeries_1',
            type: 'area'
          },
          {
            axis: 'y',
            dataset: 'dataset1',
            key: 'val_1',
            id: 'mySeries_2',
            type: 'line'
          }
        ]
      });
    });

    it('should return all series for type LINE', () => {
      var testing = options.getSeriesByType(SeriesOptions.TYPE.LINE);
      var expected = [
      options.series[0],
      options.series[2]
      ];

      expect(testing).toEqual(expected);
    });

    it('should return all series for type AREA', () => {
      var testing = options.getSeriesByType(SeriesOptions.TYPE.AREA);
      var expected = [
      options.series[1]
      ];

      expect(testing).toEqual(expected);
    });

    it('should return all series for type COLUMN', () => {
      var testing = options.getSeriesByType(SeriesOptions.TYPE.COLUMN);
      var expected = [];

      expect(testing).toEqual(expected);
    });

    it('should throw an error for an invalid series type', () => {
      expect(() => {
        options.getSeriesByType('invalid type');
      }).toThrow();
    });
  });
});
