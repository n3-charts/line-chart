/// <reference path='../test.spec.ts' />

describe('n3Charts.Utils.EventManager', () => {
  var eventMgr: n3Charts.Utils.EventManager = undefined;

  beforeEach(() => {
    eventMgr = new n3Charts.Utils.EventManager();
    eventMgr.strictMode = false;
  });

  describe('init()', () => {

    it('should parse arguments', () => {

      expect(() => eventMgr.init(['test'])).not.toThrow();
    });

    it('should return the instance', () => {

      var e = eventMgr.init([]);

      expect(e).toBe(eventMgr);
    });
  });

  describe('on()', () => {

    it('should throw a TypeError, when the event is not initialized', () => {

      var e = eventMgr.init(['test']);

      expect(() => e.on('test', () => 'test')).not.toThrow();
      expect(() => e.on('other-test', () => 'test')).toThrowError(TypeError);
    });

    it('should return the instance', () => {

      var e = eventMgr.init(['test']);

      expect(e.on('test', null)).toBe(eventMgr);
    });
  });

  describe('trigger()', () => {

    it('should trigger the handler', () => {

      var triggered = false;
      var e = eventMgr.init(['test']);

      e.on('test', () => triggered = true);
      e.trigger('test');

      expect(triggered).toBe(true);
    });

    it('should trigger only last handler', () => {

      var triggered1 = false;
      var triggered2 = false;
      var e = eventMgr.init(['test']);

      e.on('test', () => triggered1 = true);
      e.on('test', () => triggered2 = true);
      e.trigger('test');

      expect(triggered1).toBe(false);
      expect(triggered2).toBe(true);
    });

    it('should not trigger handler when deactivated', () => {

      var triggered1 = false;
      var triggered2 = false;
      var e = eventMgr.init(['test']);

      e.on('test', () => triggered1 = true);
      e.on('test', () => triggered2 = true);
      e.on('test', null);
      e.trigger('test');

      expect(triggered1).toBe(false);
      expect(triggered2).toBe(false);
    });

    it('should trigger multiple namespaced handlers', () => {

      var triggered1 = false;
      var triggered2 = false;
      var e = eventMgr.init(['test']);

      e.on('test.ns1', () => triggered1 = true);
      e.on('test.ns2', () => triggered2 = true);
      e.trigger('test');

      expect(triggered1).toBe(true);
      expect(triggered2).toBe(true);
    });

    it('should pass additional arguments to handler', () => {

      var args = undefined;
      var e = eventMgr.init(['test']);

      e.on('test', function() { args = arguments; });
      e.trigger('test', 'arg1', 2, true);

      expect(args[0]).toBe('arg1');
      expect(args[1]).toBe(2);
      expect(args[2]).toBe(true);
    });

    it('should throw a TypeError, when the event is not initialized', () => {

      var e = eventMgr.init(['test']);

      expect(() => e.trigger('test')).not.toThrow();
      expect(() => e.trigger('other-test')).toThrowError(TypeError);
    });

    it('should return the instance', () => {

      var e = eventMgr.init(['test']);

      expect(e.trigger('test')).toBe(eventMgr);
    });
  });
});
