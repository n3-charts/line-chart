/// <reference path='../test.spec.ts' />

describe('n3Charts.Factory.Container', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var container: n3Charts.Factory.Container = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();

    container = new n3Charts.Factory.Container(domElement[0]);
  });

  describe('createRoot()', () => {

    it('should create a svg root node', () => {

      var rootNode: SVGElement = undefined;

      container.createRoot();

      rootNode = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      expect(rootNode.getAttribute('class')).toBe('chart');
    });

    it('should provide a svg property', () => {

      var svgProp: SVGElement = undefined;

      expect(container.svg).toBe(undefined);

      container.createRoot();

      svgProp = <SVGElement>container.svg[0][0];

      expect(svgProp.getAttribute('class')).toBe('chart');
    });

  });

  describe('createContainer()', () => {

    it('should create a vis container', () => {

      var visContainer: SVGElement = undefined;

      container.createRoot();
      container.createContainer();

      visContainer = <SVGElement> domElement[0].getElementsByTagName('g')[0];

      expect(visContainer.getAttribute('class')).toBe('container');
    });

    it('should provide a vis property', () => {

      var visProp: SVGElement = undefined;

      expect(container.vis).toBe(undefined);

      container.createRoot();
      container.createContainer();

      visProp = <SVGElement>container.vis[0][0];

      expect(visProp.getAttribute('class')).toBe('container');
    });

    it('should create an axes container', () => {

      var dataContainer: SVGElement = undefined;

      container.createRoot();
      container.createContainer();

      dataContainer = <SVGElement> domElement[0].getElementsByTagName('g')[1];

      expect(dataContainer.getAttribute('class')).toBe('axes');
    });

    it('should create a data container', () => {

      var dataContainer: SVGElement = undefined;

      container.createRoot();
      container.createContainer();

      dataContainer = <SVGElement> domElement[0].getElementsByTagName('g')[2];

      expect(dataContainer.getAttribute('class')).toBe('data');
    });

    it('should provide a data property', () => {

      var dataProp: SVGElement = undefined;

      expect(container.data).toBe(undefined);

      container.createRoot();
      container.createContainer();

      dataProp = <SVGElement>container.data[0][0];

      expect(dataProp.getAttribute('class')).toBe('data');
    });

  });
});
