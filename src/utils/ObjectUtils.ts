module n3Charts.Utils {
  'use strict';

  export class ObjectUtils {

    public static isFunction(wut:any):Boolean {
      return wut instanceof Function;
    }

    public static isDate(wut:any):Boolean {
      return wut instanceof Date;
    }

    public static isObject(wut:any):Boolean {
      return !(wut instanceof Array) && wut instanceof Object;
    }

    public static isArray(wut:any):Boolean {
      return wut instanceof Array;
    }

    public static isBoolean(wut:any):Boolean {
      return wut === true || wut === false;
    }

    public static isReference(wut:any):Boolean {
      return wut instanceof Array || wut instanceof Object;
    }

    public static sameType(a, b): Boolean {
      if (ObjectUtils.isArray(a) && ObjectUtils.isArray(b)) {
        return true;
      }

      if (ObjectUtils.isObject(a) && ObjectUtils.isObject(b)) {
        return true;
      }

      return typeof a === typeof b;
    }

    public static extend<T>(target:T, source):T {
      let {copy, extend, sameType, isReference, isFunction} = ObjectUtils;

      let result = Utils.ObjectUtils.copy(target);

      if (!source) {
        return result;
      }

      for (let key in source) {
        if (!source.hasOwnProperty(key)) {
          continue;
        }

        if (!target.hasOwnProperty(key) || !sameType(target[key], source[key])) {
          result[key] = copy(source[key]);
        } else if (sameType(target[key], source[key])) {
          if (isFunction(target[key])) {
            result[key] = source[key];
          } else if (isReference(target[key])) {
            result[key] = extend(target[key], source[key]);
          } else {
            result[key] = source[key];
          }
        }
      }
      return result;
    }

    public static copy<T>(source:T):T {
      if (ObjectUtils.isDate(source)) {
        // Flippin' generic types force me to return an any BUT WHO CARES
        return <any>new Date(source['getTime']());
      }

      if (ObjectUtils.isFunction(source)) {
        return source; // We don't do functions.
      }

      if (source instanceof Array) {
        // Dirty but type guards don't play nice with generic types and
        // EVERYTHING IS BROKEN THIS MORNING SO I don't care.
        let n = source['length'];
        let ret:any = [];
        for (let i = 0; i < n; i++) {
          ret[i] = ObjectUtils.copy(source[i]);
        }
        return ret;
      }

      if (source instanceof Object) {
        let ret:any = {};
        for (let key in source) {
          if (source.hasOwnProperty(key)) {
            ret[key] = ObjectUtils.copy(source[key]);
          }
        }
        return ret;
      }

      return source;
    };
  }
}
