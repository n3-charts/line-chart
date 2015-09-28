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

    it('should create an array as series property', () => {
      options = new Options();

      var testing = angular.isArray(options.series);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should create an object as margin property', () => {
      options = new Options();

      var testing = angular.isObject(options.margin);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should create an object as axes property', () => {
      options = new Options();

      var testing = angular.isObject(options.axes);
      var expected = true;

      expect(testing).to.equal(expected);
    });
  });

  describe('getSanitizedOptions', () => {
    beforeEach(() => {
      options = new Options();
    });

    it('should create an array as series property', () => {
      var opt = options.getSanitizedOptions();

      var testing = angular.isArray(opt.series);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should throw a type error when series argument is not an array', () => {
      var arg = { series: {foo: 'bar'} };

      expect(() => {
          options.getSanitizedOptions(arg);
      }).to.throwError();
    });

    it('should create an object as margin property', () => {
      var opt = options.getSanitizedOptions();

      var testing = angular.isObject(opt.margin);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should throw a type error when margin argument is not an object', () => {
      var arg = { margin: 'bar' };

      expect(() => {
          options.getSanitizedOptions(arg);
      }).to.throwError();
    });

    it('should create an object as axes property', () => {
      var opt = options.getSanitizedOptions();

      var testing = angular.isObject(opt.axes);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should throw a type error when axes argument is not an object', () => {
      var arg = { axes: 'bar' };

      expect(() => {
          options.getSanitizedOptions(arg);
      }).to.throwError();
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

      expect(testing).to.eql(expected);
    });

    it('should return all series for type AREA', () => {
      var testing = options.getSeriesByType(SeriesOptions.TYPE.AREA);
      var expected = [
      options.series[1]
      ];

      expect(testing).to.eql(expected);
    });

    it('should return all series for type COLUMN', () => {
      var testing = options.getSeriesByType(SeriesOptions.TYPE.COLUMN);
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
