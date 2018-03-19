import * as angular from 'angular';
import * as sinon from 'sinon';
import { expect } from 'chai';

import * as Utils from '../utils/_index';
import { Axis } from '../factories/_index';
import { Options, SeriesOptions, AxisOptions, IMargin, ISeriesOptions, ITwoAxes, IAxesSet } from './_index';

describe('SeriesOptions', () => {
  // Placeholder for module instance
  var seriesOptions: SeriesOptions;

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
      expect(new SeriesOptions()).to.be.an.instanceof(SeriesOptions);
    });

    it('should create an axis property with the type string', () => {
      expect(seriesOptions.axis).to.be.a('string');
    });

    it('should assign the proper axis property', () => {
      expect(seriesOptions.axis).to.equal('y');
    });

    it('should create a dataset property with the type string', () => {
      expect(seriesOptions.dataset).to.be.a('string');
    });

    it('should assign the proper dataset property', () => {
      expect(seriesOptions.dataset).to.equal('dataset0');
    });

    it('should create a key property with the proper type', () => {
      expect(seriesOptions.key).to.be.an('object');
    });

    it('should assign the proper key property', () => {
      expect(seriesOptions.key).to.eql({y1: 'val_0'});
    });

    it('should create a color property with the type string', () => {
      expect(seriesOptions.color).to.be.a('string');
    });

    it('should assign the proper color property', () => {
      expect(seriesOptions.color).to.equal('steelblue');
    });

    it('should create an id property with the type string', () => {
      expect(seriesOptions.id).to.be.a('string');
    });

    it('should assign the proper id property', () => {
      expect(seriesOptions.id).to.equal('mySeries_0');
    });

    it('should create a label property with the type string', () => {
      expect(seriesOptions.label).to.be.a('string');
    });

    it('should assign the proper label property', () => {
      expect(seriesOptions.label).to.equal(`You're the series`);
    });

    it('should create a type property with the type array', () => {
      expect(seriesOptions.type).to.be.an('array');
    });

    it('should assign the proper type property', () => {
      expect(seriesOptions.type[0]).to.equal('area');
    });

    it('should use default type if no option defined', () => {
      var seriesOptions = new SeriesOptions();
      expect(seriesOptions.type[0]).to.equal('line');
    });

    it('should use default visibility if no option defined', () => {
      var seriesOptions = new SeriesOptions();
      expect(seriesOptions.visible).to.equal(true);
    });
  });

  describe('sanitizeType', () => {
    beforeEach(() => {
      seriesOptions = new SeriesOptions();
    });

    it('should return only valid types', () => {
      var warnSpy = sinon.stub(console, 'warn', () => {});

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

      expect(warnSpy.callCount).to.equal(2);
      expect(warnSpy.args).to.eql([
        ['Unknow series type : foo'],
        ['Unknow series type : bar']
      ]);

      warnSpy.restore();
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
      }).to.throw();
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
