module n3Charts.Utils {
  'use strict';

  export class FunctionUtils {

    public static debounce(callback, interval) {
        var t = null;
        return (...args) => {
          if (t) {
            window.clearTimeout(t);
          }

          t = window.setTimeout(() => callback.apply(this, args), interval);
        };
      };
  }

  export class UUID {

    public static generate() {
      // @src: http://stackoverflow.com/a/2117523
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          }
        );
    }
  }
}
