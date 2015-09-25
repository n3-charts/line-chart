/// <reference path='../test.spec.ts' />

describe('n3Charts.Utils.Options', () => {
  // Type Shortcut
  var Options = n3Charts.Utils.Options;
  var SeriesOptions = n3Charts.Utils.SeriesOptions;
  var AxisOptions = n3Charts.Utils.AxisOptions;
  var Axis = n3Charts.Factory.Axis;
  // Placeholder for module instance
  var options: n3Charts.Utils.Options;

  describe('constructor', () => {
    it('should create an instance without arguments', () => {
      options = new Options();

      var testing = options instanceof Options;
      var expected = true;

      expect(testing).to.equal(expected);
    });
  });

  describe('parse', () => {
    beforeEach(() => {
      options = new Options();
    });

    it('should call parseSeries function with series property', () => {
      var arg = { series: ['foo', 'bar'] };
      var spy = sinon.spy(options, 'parseSeries');

      options.parse(arg);

      var testing = spy.calledWith(arg.series);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should call parseSeries function with default arguments', () => {
      var arg = { foo: 'bar' };
      var spy = sinon.spy(options, 'parseSeries');

      options.parse(arg);

      var testing = spy.calledWith(Options.DEFAULT.series);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should create an empty array as series property when called without arguments', () => {
      options.parse();

      var testing = angular.isArray(options.series);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should create an array of series as series property', () => {
      var arg = { series: [{foo: 'bar'}] };

      options.parse(arg);

      var testing = options.series[0] instanceof SeriesOptions;
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should call parseAxes function with axes property', () => {
      var arg = { axes: { 'foo': 'bar' } };
      var spy = sinon.spy(options, 'parseAxes');

      options.parse(arg);

      var testing = spy.calledWith(arg.axes);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should call parseAxes function with default arguments', () => {
      var arg = { foo: 'bar' };
      var spy = sinon.spy(options, 'parseAxes');

      options.parse(arg);

      var testing = spy.calledWith(Options.DEFAULT.axes);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should create an axes property when called without arguments', () => {
      options.parse();

      var testing = angular.isObject(options.axes);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should create an axes property with x axis options', () => {
      options.parse();

      var testing = options.axes[Axis.SIDE.X] instanceof AxisOptions;
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should create an axes property with y axis options', () => {
      options.parse();

      var testing = options.axes[Axis.SIDE.Y] instanceof AxisOptions;
      var expected = true;

      expect(testing).to.equal(expected);
    });
  });

  describe('parseSeries', () => {
    beforeEach(() => {
      options = new Options();
    });

    it('should throw a type error when series argument is not an array', () => {
      var arg = { foo: 'bar' };

      expect(() => {
        options.parseSeries(arg);
      }).to.throwError();
    });

    it('should call sanitizeSeries function with default arguments', () => {
      var arg = [];
      var spy = sinon.spy(options, 'sanitizeSeries');

      options.parseSeries(arg);

      var testing = spy.calledWith(Options.DEFAULT.series);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should call sanitizeSeries function and merge arguments with default options', () => {
      var arg = ['foo'];
      var mergedArgsWithDefault = ['foo'];
      var spy = sinon.spy(options, 'sanitizeSeries');

      options.parseSeries(arg);

      var testing = spy.calledWith(mergedArgsWithDefault);
      var expected = true;

      expect(testing).to.equal(expected);
    });
  });

  describe('parseAxes', () => {
    beforeEach(() => {
      options = new Options();
    });

    it('should throw a type error when axes argument is not an object', () => {
      var arg = 'foo';

      expect(() => {
        options.parseAxes(arg);
      }).to.throwError();
    });

    it('should call sanitizeAxes function with default arguments', () => {
      var arg = {};
      var spy = sinon.spy(options, 'sanitizeAxes');

      options.parseAxes(arg);

      var testing = spy.calledWith(Options.DEFAULT.axes);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should call sanitizeAxes function and merge arguments with default options', () => {
      var arg = {x: 'foo'};
      var mergedArgsWithDefault = { x: 'foo', y: {} };
      var spy = sinon.spy(options, 'sanitizeAxes');

      options.parseAxes(arg);

      var testing = spy.calledWith(mergedArgsWithDefault);
      var expected = true;

      expect(testing).to.equal(expected);
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
      var testing = options.getSeriesByType(Options.SERIES_TYPES.LINE);
      var expected = [
      options.series[0],
      options.series[2]
      ];

      expect(testing).to.eql(expected);
    });

    it('should return all series for type AREA', () => {
      var testing = options.getSeriesByType(Options.SERIES_TYPES.AREA);
      var expected = [
      options.series[1]
      ];

      expect(testing).to.eql(expected);
    });

    it('should return all series for type COLUMN', () => {
      var testing = options.getSeriesByType(Options.SERIES_TYPES.COLUMN);
      var expected = [];

      expect(testing).to.eql(expected);
    });

    it('should throw an error for an invalid series type', () => {
      expect(() => {
        options.getSeriesByType('invalid type');
      }).to.throwError();
    });
  });
});
