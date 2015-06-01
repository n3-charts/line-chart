/// <reference path='../test.mocha.ts' />

class StyleStub {

  static template = {
    '.': {
      'color': 'rgb(0, 255, 0)',
      'background-color': 'rgb(255, 0, 0)'
    },
    '.test': {
      'font-size': '10px'
    }
  };
}

describe('n3Charts.Factory.StyleSheet', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var styleSheet: n3Charts.Factory.StyleSheet = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();
    domElement.append('<p class="test" style="width: 100%;"></p>');

    styleSheet = new n3Charts.Factory.StyleSheet();
  });

  describe('updateStyle()', () => {
    
    it('should style the element', () => {

      var rootNode: HTMLElement = undefined;
      var testNode: HTMLElement = undefined;
      
      var style = StyleStub.template;
      var selection = d3.select(domElement[0]);

      var expectRootStyle = /^color: rgb\(0, 255, 0\); background-color: rgb\(255, 0, 0\);$/;
      var expectTestStyle = /^width: 100%; font-size: 10px;$/;

      styleSheet.updateStyle(selection, style);

      rootNode = domElement[0];
      testNode = <HTMLElement> domElement[0].getElementsByClassName('test')[0];

      expect(rootNode.getAttribute('style')).to.match(expectRootStyle);
      expect(testNode.getAttribute('style')).to.match(expectTestStyle);
    });
  });

  describe('destroyStyle()', () => {
    
    it('should remove the element style', () => {

      var rootNode: HTMLElement = undefined;
      var testNode: HTMLElement = undefined;
      
      var style = StyleStub.template;
      var selection = d3.select(domElement[0]);

      styleSheet.updateStyle(selection, style);
      styleSheet.destroyStyle(selection, style);

      rootNode = domElement[0];
      testNode = <HTMLElement> domElement[0].getElementsByClassName('test')[0];

      var expectTestStyle = /^width: 100%;$/;

      expect(rootNode.getAttribute('style')).to.equal(null);
      expect(testNode.getAttribute('style')).to.match(expectTestStyle);
    });
  });
});
