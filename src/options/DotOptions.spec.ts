/// <reference path='../test.spec.ts' />

describe('n3Charts.Options.DotOptions', () => {
  // Type Shortcut
  var DotOptions = n3Charts.Options.DotOptions;
  // Placeholder for module instance
  var dotOptions = n3Charts.Options.DotOptions;

  describe('constructor', () => {
    it('should create an instance without arguments', () => {
      var dotOptions = new DotOptions();

      var testing = dotOptions instanceof DotOptions;
      var expected = true;

      expect(testing).toBe(expected);
    });
  });
});