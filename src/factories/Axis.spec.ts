import {expect} from 'chai';

import * as Utils from '../utils/_index';
import * as Options from '../options/_index';
import * as Factory from './_index';

describe('Factory.Axis', () => {
  var axis: Factory.Axis = undefined;

  beforeEach(() => {
    axis = new Factory.Axis('y');
  });

  describe('constructor()', () => {

    it('should return an instance', () => {

      axis = new Factory.Axis('x');

      expect(axis).to.be.an.instanceof(Factory.Axis);
    });

    it('should throw an error if side isn\'t x or y', () => {
      expect(() => new Factory.Axis('x')).not.to.throw();
      expect(() => new Factory.Axis('y')).not.to.throw();
      expect(() => new Factory.Axis('pouet')).to.throw();
    });
  });

  describe('extent', () => {
    it('should consider every data point', () => {
      axis = new Factory.Axis('y');

      var data = new Utils.Data({dataset0: [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: '-Infinity'},
        {x: 3, y: 3},
        {x: 4, y: -2}
      ]});

      var options = new Options.Options({
        series: [{
          axis: 'y',
          dataset: 'dataset0',
          key: 'y',
          type: 'area'
        }]
      });

      // The series doesn't tell us anything about Infinity not being defined,
      // so this result is stupid but expected.
      expect(axis.getExtent(data, options)).to.eql(['-Infinity', 3]);
    });

    it('should consider only defined data point', () => {
      axis = new Factory.Axis('y');

      var data = new Utils.Data({dataset0: [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: '-Infinity'},
        {x: 3, y: 3},
        {x: 4, y: -2}
      ]});

      var options = new Options.Options({
        series: [{
          axis: 'y',
          dataset: 'dataset0',
          key: 'y',
          type: 'area',
          defined: function(datum) {
            return typeof datum.y1 === 'number';
          }
        }]
      });

      // The series doesn't tell us anything about Infinity not being defined,
      // so this result is stupid but expected.
      expect(axis.getExtent(data, options)).to.eql([-2, 3]);
    });

  });

  it('should clone the d3 axis', () => {
    axis = new Factory.Axis('x');

    axis.scale = axis.getScale();
    axis.d3axis = axis.getAxis(axis['_scale'], new Options.AxisOptions({
      ticks: 5
    }));

    var clone = axis.cloneAxis();
    expect(clone.ticks()).to.eql(axis.d3axis.ticks());
  });
});
