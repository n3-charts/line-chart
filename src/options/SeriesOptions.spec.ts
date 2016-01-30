/// <reference path='../test.spec.ts' />

describe('n3Charts.Options.SeriesOptions', () => {
  // Type Shortcut
  var SeriesOptions = n3Charts.Options.SeriesOptions;
  // Placeholder for module instance
  var seriesOptions: n3Charts.Options.SeriesOptions;

  describe('constructor', () => {
    beforeEach(() => {
      var arg = {
        axis: 'y',
        dataset: 'dataset0',
        key: 'val_0',
        color: 'steelblue',
        id: 'mySeries_0',
        label: 'You\'re the series',
        visible: true,
        type: 'area'
      };

      seriesOptions = new SeriesOptions(arg);
    });

    it('should create an instance without arguments', () => {
      var seriesOptions = new SeriesOptions();

      var testing = seriesOptions instanceof SeriesOptions;
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should create an axis property with the type string', () => {
      var testing = angular.isString(seriesOptions.axis);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should assign the proper axis property', () => {
      var testing = seriesOptions.axis;
      var expected = 'y';

      expect(testing).to.equal(expected);
    });

    it('should create a dataset property with the type string', () => {
      var testing = angular.isString(seriesOptions.dataset);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should assign the proper dataset property', () => {
      var testing = seriesOptions.dataset;
      var expected = 'dataset0';

      expect(testing).to.equal(expected);
    });

    it('should create a key property with the proper type', () => {
      var testing = angular.isObject(seriesOptions.key);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should assign the proper key property', () => {
      var testing = seriesOptions.key;
      var expected = {y1: 'val_0'};

      expect(testing).to.eql(expected);
    });

    it('should create a color property with the type string', () => {
      var testing = angular.isString(seriesOptions.color);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should assign the proper color property', () => {
      var testing = seriesOptions.color;
      var expected = 'steelblue';

      expect(testing).to.equal(expected);
    });

    it('should create an id property with the type string', () => {
      var testing = angular.isString(seriesOptions.id);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should assign the proper id property', () => {
      var testing = seriesOptions.id;
      var expected = 'mySeries_0';

      expect(testing).to.equal(expected);
    });

    it('should create a label property with the type string', () => {
      var testing = angular.isString(seriesOptions.label);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should assign the proper label property', () => {
      var testing = seriesOptions.label;
      var expected = 'You\'re the series';

      expect(testing).to.equal(expected);
    });

    it('should create a type property with the type array', () => {
      var testing = angular.isArray(seriesOptions.type);
      var expected = true;

      expect(testing).to.equal(expected);
    });

    it('should assign the proper type property', () => {
      var testing = seriesOptions.type[0];
      var expected = 'area';

      expect(testing).to.equal(expected);
    });

    it('should use default type if no option defined', () => {
      var seriesOptions = new SeriesOptions();

      var testing = seriesOptions.type[0];
      var expected = 'line';

      expect(testing).to.equal(expected);
    });

    it('should use default visibility if no option defined', () => {
      var seriesOptions = new SeriesOptions();

      var testing = seriesOptions.visible;
      var expected = true;

      expect(testing).to.equal(expected);
    });
  });

  describe('sanitizeType', () => {
    beforeEach(() => {
      seriesOptions = new SeriesOptions();
    });

    it('should return only valid types', () => {
      var warnStub = sinon.stub(console, 'warn');

      var arg = [
        'foo',
        'bar',
        SeriesOptions.TYPE.DOT,
        SeriesOptions.TYPE.LINE
      ];

      var testing = seriesOptions.sanitizeType(arg);
      var expected = [
        SeriesOptions.TYPE.DOT,
        SeriesOptions.TYPE.LINE
      ];

      expect(testing).to.eql(expected);

      expect(warnStub.callCount).to.equal(2);
      expect(warnStub.args).to.eql([
        ['Unknow series type : foo'],
        ['Unknow series type : bar']
      ]);

      warnStub.restore();
    });
  });

  describe('sanitizeAxis', () => {
    beforeEach(() => {
      seriesOptions = new SeriesOptions();
    });

    it('should return valid axis', () => {
      var arg = 'y';

      var testing = seriesOptions.sanitizeAxis(arg);
      var expected = 'y';

      expect(testing).to.equal(expected);
    });

    it('should throw a type error when axis argument is not valid', () => {
      var arg = 'a';

      expect(() => {
          seriesOptions.sanitizeAxis(arg);
      }).to.throwError();
    });
  });

  describe('getToggledVisibility', () => {
    var visible: boolean;

    beforeEach(() => {
      seriesOptions = new SeriesOptions({
        axis: 'y',
        dataset: 'dataset0',
        key: 'val_0',
        id: 'mySeries_0',
        type: ['area']
      });

      visible = seriesOptions.getToggledVisibility();
    });

    it('should return the toggled visibility', () => {
      var testing = visible;
      var expected = false;

      expect(testing).to.equal(expected);
    });

    it('should  not change the current visibility', () => {
      var testing = seriesOptions.visible;
      var expected = true;

      expect(testing).to.equal(expected);
    });
  });
});
