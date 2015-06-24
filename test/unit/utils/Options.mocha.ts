/// <reference path='../test.mocha.ts' />

describe('n3Charts.Utils.Options', () => {
  var Options = undefined;

  beforeEach(() => {
    Options = n3Charts.Utils.Options;
  });

  it('should have a default', () => {
    var options = new Options({});
    expect(options.toJS()).to.eql({series: [], axes: []});

    options = new Options(undefined);
    expect(options.toJS()).to.eql({series: [], axes: []});
  });

  it('should return the series per type', () => {
    var options = new Options({series: [
      {
        axis: "y",
        dataset: "dataset0",
        key: "val_0",
        id: 'mySeries_0',
        type: "line"
      },
      {
        axis: "y",
        dataset: "dataset2",
        key: "val_1",
        id: 'mySeries_1',
        type: "area"
      },
      {
        axis: "y",
        dataset: "dataset1",
        key: "val_1",
        id: 'mySeries_2',
        type: "line"
      }
    ]});

    expect(options.getSeriesForType(Options.SERIES_TYPES.LINE)).to.eql([
      options.series[0],
      options.series[2]
    ]);

    expect(options.getSeriesForType(Options.SERIES_TYPES.AREA)).to.eql([
      options.series[1]
    ]);

    expect(options.getSeriesForType(Options.SERIES_TYPES.COLUMN)).to.eql([]);

    expect(() => {options.getSeriesForType('invalid type')}).to.throwError();
  });
});
