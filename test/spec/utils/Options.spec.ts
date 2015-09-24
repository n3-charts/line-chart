/// <reference path='../test.spec.ts' />

describe('n3Charts.Utils.Options', () => {
  // Type Shortcut
  var Options = n3Charts.Utils.Options;
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