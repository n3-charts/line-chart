/// <reference path='../test.spec.ts' />

describe('n3Charts.Utils.EventManager', () => {
  var eventMgr: n3Charts.Utils.EventManager = undefined;

  beforeEach(() => {
    eventMgr = new n3Charts.Utils.EventManager();
    eventMgr.strictMode = false;
  });

  describe('init()', () => {

    it('should parse arguments', () => {

      expect(() => eventMgr.init(['test'])).to.not.throwError();
    });

    it('should return the instance', () => {

      var e = eventMgr.init([]);

      expect(e).to.equal(eventMgr);
    });
  });

  describe('on()', () => {

    it('should throw a TypeError, when the event is not initialized', () => {

      var e = eventMgr.init(['test']);

      expect(() => e.on('test', () => 'test')).to.not.throwError();
      expect(() => e.on('other-test', () => 'test')).to.throwError(TypeError);
    });

    it('should return the instance', () => {

      var e = eventMgr.init(['test']);

      expect(e.on('test', null)).to.equal(eventMgr);
    });
  });

  describe('trigger()', () => {

    it('should trigger the handler', () => {

      var triggered = false;
      var e = eventMgr.init(['test']);

      e.on('test', () => triggered = true);
      e.trigger('test');

      expect(triggered).to.equal(true);
    });

    it('should trigger only last handler', () => {

      var triggered1 = false;
      var triggered2 = false;
      var e = eventMgr.init(['test']);

      e.on('test', () => triggered1 = true);
      e.on('test', () => triggered2 = true);
      e.trigger('test');

      expect(triggered1).to.equal(false);
      expect(triggered2).to.equal(true);
    });

    it('should not trigger handler when deactivated', () => {

      var triggered1 = false;
      var triggered2 = false;
      var e = eventMgr.init(['test']);

      e.on('test', () => triggered1 = true);
      e.on('test', () => triggered2 = true);
      e.on('test', null);
      e.trigger('test');

      expect(triggered1).to.equal(false);
      expect(triggered2).to.equal(false);
    });

    it('should trigger multiple namespaced handlers', () => {

      var triggered1 = false;
      var triggered2 = false;
      var e = eventMgr.init(['test']);

      e.on('test.ns1', () => triggered1 = true);
      e.on('test.ns2', () => triggered2 = true);
      e.trigger('test');

      expect(triggered1).to.equal(true);
      expect(triggered2).to.equal(true);
    });

    it('should pass additional arguments to handler', () => {

      var args = undefined;
      var e = eventMgr.init(['test']);

      e.on('test', function() { args = arguments; });
      e.trigger('test', 'arg1', 2, true);

      expect(args[0]).to.equal('arg1');
      expect(args[1]).to.equal(2);
      expect(args[2]).to.equal(true);
    });

    it('should throw a TypeError, when the event is not initialized', () => {

      var e = eventMgr.init(['test']);

      expect(() => e.trigger('test')).to.not.throwError();
      expect(() => e.trigger('other-test')).to.throwError(TypeError);
    });

    it('should return the instance', () => {

      var e = eventMgr.init(['test']);

      expect(e.trigger('test')).to.equal(eventMgr);
    });
  });
});
