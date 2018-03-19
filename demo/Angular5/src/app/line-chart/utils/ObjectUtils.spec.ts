import { expect } from 'chai';

import { ObjectUtils } from './ObjectUtils';

describe('ObjectUtils', () => {
  describe('copy', () => {
    let copy = ObjectUtils.copy;

    describe('primitive types', () => {
      it('should work with numbers', () => {
        expect(copy(1)).to.eql(1);
      });

      it('should work with booleans', () => {
        expect(copy(true)).to.eql(true);
      });

      it('should work with strings', () => {
        expect(copy('pouet')).to.eql('pouet');
      });

      it('should work with dates', () => {
        let d = new Date();
        expect(copy(d).getTime()).to.eql(d.getTime());
      });
    });

    describe('funky types', () => {
      it('should work with NaNs (VTS !)', () => {
        expect(copy(NaN)).to.eql(NaN);
      });

      it('should work with undefined', () => {
        expect(copy(undefined)).to.eql(undefined);
      });

      it('should work with null', () => {
        expect(copy(null)).to.eql(null);
      });

      it('should work with function', () => {
        let fn = () => 'pouet';

        expect(copy(fn)).to.equal(fn);
      });
    });

    describe('references', () => {
      it('should work with objects', () => {
        let o = {foo: 'bar', baz: false, qux: undefined};

        expect(copy(o)).to.eql(o);
        expect(copy(o)).not.to.equal(o);
      });

      it('should work with arrays', () => {
        let o = ['qux', false, {foo: 'bar', baz: false}];

        expect(copy(o)).to.eql(o);
        expect(copy(o)).not.to.equal(o);
      });
    });
  });

  describe('extend', () => {
    let extend = ObjectUtils.extend;

    it('should work with simple objects', () => {
      let o = {foo: 'bar', baz: false, qux: undefined};

      expect(extend({}, o)).to.eql(o);
      expect(extend({}, o)).not.to.equal(o);
    });

    it('should work with complex objects', () => {
      let o = {foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]};

      expect(extend({}, o)).to.eql(o);
      expect(extend({}, o)).not.to.equal(o);
    });

    describe('with an already populated target', () => {
      it('different subtypes', () => {
        let source = {foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]};
        let target = {foo: 'pouet'};
        let result = extend(target, source);

        expect(result).to.eql(source);
        expect(result).not.to.equal(source);
        expect(result).not.to.equal(target);
      });

      it('same subtypes, new values', () => {
        let source = {foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]};
        let target = {foo: {qux: 'pouet'}};
        let result = extend(target, source);

        expect(result).to.eql({foo: {foo: 'bar', baz: false, qux: 'pouet'}, baz: [1, 2, 3]});
        expect(result).not.to.equal(source);
        expect(result).not.to.equal(target);
      });

      it('same subtypes, same values', () => {
        let source = {foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]};
        let target = {foo: {foo: 'bar', baz: false}};
        let result = extend(target, source);

        expect(result).to.eql({foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]});
        expect(result).not.to.equal(source);
        expect(result).not.to.equal(target);
      });

      it('with different functions', () => {
        let source = {foo: {foo: 'bar', func: () => 'should override'}, baz: [1, 2, 3]};
        let target = {foo: {foo: 'bar', func: () => 'should be overriden'}};
        let result = extend(target, source);

        // To make sure the proper function has been passed
        expect(result.foo.func()).to.eql('should override');

        expect(result).to.eql(source);
        expect(result).not.to.equal(source);
        expect(result).not.to.equal(target);
      });
    });
  });
});
