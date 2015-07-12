/// <reference path='../test.spec.ts' />

describe('n3Charts.Utils.Series', () => {
  var Series = undefined;

  beforeEach(() => {
    Series = n3Charts.Utils.Series;
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

    expect(new Series(js)).to.eql(js);
  });

  it('should give the toggled visibility - and not change the current one', () => {
    var series = new Series({
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

    expect(new Series(given)).to.eql(computed);
  });
});
