angular.module('pretty', [])

.factory('prettyfier', function() {
  return {
    formatKey: function(value) {
      return '<span style="color: #B919A8;">' + value + '</span> : ';
    },
    
    isNative: function(value) {
      return ['string', 'number', 'function', 'boolean'].indexOf(typeof value) !== -1;
    },
    
    prettifyNative: function(value) {
      if (typeof value == 'string') {
        return '<span style="color: red">"' + value + '"</span>';
      }
      
      if (typeof value == 'number') {
        return '<span style="color: blue">"' + value + '"</span>';
      }
      
      if (typeof value == 'function') {
        return '<span style="">' + value.toString() + '</span>';
      }
      
      if (typeof value == 'boolean') {
        return '<span style="color: green">' + value.toString() + '</span>';
      }
      
      return value.toString();
    },
    
    prettify: function(object, depth, padding) {
      if (this.isNative(object)) {
        return this.prettifyNative(object);
      }
      
      if (depth === 0) {
        return this.prettyFlat(object);
      }
      
      var isArray = angular.isArray(object);
      
      var lines = [];
      if (isArray) {
        for (var i = 0; i < object.length; i++) {
          lines.push(padding + this.prettify(object[i], depth - 1, padding + '  '));
        }
      } else {
        for (var key in object) {
          lines.push(padding + this.formatKey(key) + this.prettify(object[key], depth - 1, padding + '  '));
        }
      }
      
      padding = padding.replace(/.{2}$/, '');
      
      return (isArray ? '[' : '{') + '\n' + lines.join(',\n') + '\n' + padding + (isArray ? ']' : '}');
    },
    
    prettyFlat: function(object) {
      if (this.isNative(object)) {
        return this.prettifyNative(object);
      }
      
      var isArray = angular.isArray(object);
      
      var lines = [];
      if (isArray) {
        for (var i = 0; i < object.length; i++) {
          lines.push(this.prettyFlat(object[i]));
        }
      } else {
        for (var key in object) {
          lines.push(this.formatKey(key) + this.prettyFlat(object[key]));
        }
      }
      
      return (isArray ? '[' : '{') + lines.join(', ') + (isArray ? ']' : '}');
    }
  };
})

.filter('pretty', function(prettyfier) {
  return function(object, depth) {
    if (depth === undefined) {
      depth = 2;
    }
    
    return prettyfier.prettify(object, depth, '  ');
  };
})