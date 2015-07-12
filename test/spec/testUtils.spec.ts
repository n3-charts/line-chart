var utils;

// This needs to be cleaned, and maybe externalized into a small testing
// framework utils. But then we'd need to find a name for it.
utils = angular.module('testUtils', []);

utils.factory('directive', function($compile, $rootScope, fakeMouse) {
  return {
    flushD3Transitions: function(d3) {
      var now = Date.now;
      Date.now = function() {
        return Infinity;
      };
      d3.timer.flush();
      Date.now = now;
    },
    clearDOM: function() {
      document.body.innerHTML = '';
    },
    addToDOM: function(wrappedElement) {
      $(document.body).append(wrappedElement.aElement);
    },
    create: function(html, preHook) {
      var elm = angular.element(html);
      var outerScope = $rootScope;
      if (typeof preHook === 'function') {
        preHook({outerScope: outerScope});
      }
      $compile(elm)(outerScope);
      var innerScope = elm.isolateScope();
      outerScope.$digest();
      return {
        outerScope: outerScope,
        innerScope: innerScope,
        element: this.wrap(elm[0])
      };
    },
    wrap: function(_domElement) {
      var _aElement = angular.element(_domElement);
      var that = this;
      return {
        domElement: _domElement,
        aElement: _aElement,
        click: function(additionalArgs) {
          return fakeMouse.clickOn(_domElement, false, additionalArgs);
        },
        mouseDown: function(additionalArgs) {
          return fakeMouse.mouseDownOn(_domElement, false, additionalArgs);
        },
        mouseMove: function(additionalArgs) {
          return fakeMouse.mouseMoveOn(_domElement, false, additionalArgs);
        },
        mouseOver: function(additionalArgs) {
          return fakeMouse.mouseOverOn(_domElement, false, additionalArgs);
        },
        mouseOut: function(additionalArgs) {
          return fakeMouse.mouseOutOn(_domElement, false, additionalArgs);
        },
        mouseUp: function(additionalArgs) {
          return fakeMouse.mouseUpOn(_domElement, false, additionalArgs);
        },
        clickAndBubbleUp: function() {
          return fakeMouse.clickOn(_domElement, true);
        },
        child: function(selector) {
          var elements = _domElement.querySelectorAll(selector);
          if (elements.length === 0) {
            throw new Error('No element found with selector ' + selector);
          } else if (elements.length > 1) {
            throw new Error('More than one element found with selector ' + selector);
          }
          return that.wrap(elements[0]);
        },
        children: function(selector) {
          if (selector) {
            return (function() {
              var list = _domElement.querySelectorAll(selector);
              var results = [];
              for (var i = 0; i < list.length; i++) {
                results.push(that.wrap(list.item(i)));
              }
              return results;
            })();
          }
        },
        isHidden: function() {
          return _aElement.hasClass('ng-hide');
        },
        isVisible: function() {
          return _aElement.hasClass('ng-hide') === false;
        },
        hasClass: function(c) {
          return _aElement.hasClass(c);
        },
        innerHTML: function() {
          return _domElement.innerHTML;
        },
        value: function() {
          return _domElement.value;
        },
        getElementStyle: function() {
          var stylesByKey = {};
          _domElement.getAttribute('style').trim().split(/\s*;\s*/).filter(Boolean).forEach(function(style) {
            var splitted = style.split(/\s*:\s*/);
            return stylesByKey[splitted[0]] = splitted[1];
          });
          return stylesByKey;
        }
      };
    }
  };
});

utils.factory('fakeMouse', function() {
  var eventPath = function(element) {
    var path = [element];
    var tmp = element;
    while (tmp.parentNode) {
      tmp = tmp.parentNode;
      path.push(tmp);
    }
    if (tmp === document) {
      path.push(window);
    }
    return path;
  };
  var dispatch = function(element, type, additionalArgs) {
    var clientX, clientY, event, ref, screenX, screenY;
    event = document.createEvent('MouseEvent');
    ref = additionalArgs || {}, screenX = ref.screenX, screenY = ref.screenY, clientX = ref.clientX, clientY = ref.clientY;
    event.initMouseEvent(type, true, true, window, void 0, screenX, screenY, clientX, clientY);
    element.dispatchEvent(event);
    return event;
  };
  var bubbleUp = function(element, type) {
    var elm, i, len, ref, results;
    ref = eventPath(element);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      elm = ref[i];
      results.push(dispatch(elm, type, undefined));
    }
    return results;
  };
  var event = function(type) {
    return function(element, bubbles, additionalArgs) {
      if (bubbles) {
        bubbleUp(element, type);
      } else {
        dispatch(element, type, additionalArgs);
      }
    };
  };
  return {
    mouseDownOn: event('mousedown'),
    mouseOverOn: event('mouseover'),
    mouseMoveOn: event('mousemove'),
    mouseOutOn: event('mouseout'),
    mouseUpOn: event('mouseup'),
    clickOn: event('click'),
    doubleClickOn: event('dblclick'),
    hoverIn: function(element) {
      return bubbleUp(element, 'mouseover');
    },
    hoverOut: function(element) {
      return bubbleUp(element, 'mouseout');
    }
  };
});
