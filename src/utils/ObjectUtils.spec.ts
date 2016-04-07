/// <reference path='../test.spec.ts' />

describe('n3Charts.Utils.ObjectUtils', () => {
  describe('copy', () => {
    let copy = n3Charts.Utils.ObjectUtils.copy;

    describe('primitive types', () => {
      it('should work with numbers', () => {
        expect(copy(1)).toEqual(1);
      });

      it('should work with booleans', () => {
        expect(copy(true)).toEqual(true);
      });

      it('should work with strings', () => {
        expect(copy('pouet')).toEqual('pouet');
      });

      it('should work with dates', () => {
        let d = new Date()
        expect(copy(d).getTime()).toEqual(d.getTime());
      });
    });

    describe('funky types', () => {
      it('should work with NaNs (VTS !)', () => {
        expect(copy(NaN)).toEqual(NaN);
      });

      it('should work with undefined', () => {
        expect(copy(undefined)).toEqual(undefined);
      });

      it('should work with null', () => {
        expect(copy(null)).toEqual(null);
      });

      it('should work with function', () => {
        let fn = () => 'pouet';

        expect(copy(fn)).toBe(fn);
      });
    });

    describe('references', () => {
      it('should work with objects', () => {
        let o = {foo: 'bar', baz: false, qux: undefined};

        expect(copy(o)).toEqual(o);
        expect(copy(o)).not.toBe(o);
      });

      it('should work with arrays', () => {
        let o = ['qux', false, {foo: 'bar', baz: false}];

        expect(copy(o)).toEqual(o);
        expect(copy(o)).not.toBe(o);
      });
    });
  });

  describe('extend', () => {
    let extend = n3Charts.Utils.ObjectUtils.extend;

    it('should work with simple objects', () => {
      let o = {foo: 'bar', baz: false, qux: undefined};

      expect(extend({}, o)).toEqual(o);
      expect(extend({}, o)).not.toBe(o);
    });

    it('should work with complex objects', () => {
      let o = {foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]};

      expect(extend({}, o)).toEqual(o);
      expect(extend({}, o)).not.toBe(o);
    });

    describe('with an alrleady populated target', () => {
      it('different subtypes', () => {
        let source = {foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]};
        let target = {foo: 'pouet'};
        let result = extend(target, source);

        expect(result).toEqual(source);
        expect(result).not.toBe(source);
        expect(result).not.toBe(target);
      });

      it('same subtypes, new values', () => {
        let source = {foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]};
        let target = {foo: {qux: 'pouet'}};
        let result = extend(target, source);

        expect(result).toEqual({foo: {foo: 'bar', baz: false, qux: 'pouet'}, baz: [1, 2, 3]});
        expect(result).not.toBe(source);
        expect(result).not.toBe(target);
      });

      it('same subtypes, same values', () => {
        let source = {foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]};
        let target = {foo: {foo: 'bar', baz: false}};
        let result = extend(target, source);

        expect(result).toEqual({foo: {foo: 'bar', baz: false}, baz: [1, 2, 3]});
        expect(result).not.toBe(source);
        expect(result).not.toBe(target);
      });

      it('with different functions', () => {
        let source = {foo: {foo: 'bar', func: () => 'should override'}, baz: [1, 2, 3]};
        let target = {foo: {foo: 'bar', func: () => 'should be overriden'}};
        let result = extend(target, source);

        // To make sure the proper function has been passed
        expect(result.foo.func()).toEqual('should override');

        expect(result).toEqual(source);
        expect(result).not.toBe(source);
        expect(result).not.toBe(target);
      });
    });
  });
});
