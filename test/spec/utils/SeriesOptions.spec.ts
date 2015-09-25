/// <reference path='../test.spec.ts' />

describe('n3Charts.Utils.SeriesOptions', () => {
  var SeriesOptions = undefined;

  beforeEach(() => {
    SeriesOptions = n3Charts.Utils.SeriesOptions;
  });

  it('should unserialize', () => {
    var js = {
      axis: 'y',
      dataset: 'dataset0',
      key: 'val_0',
      color: 'steelblue',
      id: 'mySeries_0',
      label: 'You\'re the series',
      visible: true,
      type: ['area']
    };

    expect(new SeriesOptions(js)).to.eql(js);
  });

  it('should give the toggled visibility - and not change the current one', () => {
    var series = new SeriesOptions({
      axis: 'y',
      dataset: 'dataset0',
      key: 'val_0',
      id: 'mySeries_0',
      type: ['area']
    });

    expect(series.visible).to.equal(true);
    expect(series.getToggledVisibility()).to.equal(false);
  });

  it('should accept simple type', () => {
    var given = {
      axis: 'y',
      dataset: 'dataset0',
      key: 'val_0',
      color: 'steelblue',
      id: 'mySeries_0',
      label: 'You\'re the series',
      visible: true,
      type: 'area'
    };

    var computed = {
      axis: 'y',
      dataset: 'dataset0',
      key: 'val_0',
      color: 'steelblue',
      id: 'mySeries_0',
      label: 'You\'re the series',
      visible: true,
      type: ['area']
    };

    expect(new SeriesOptions(given)).to.eql(computed);
  });
});
