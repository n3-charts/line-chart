describe('legend', function() {
  beforeEach(function() {
    scope.$apply(function() {
      scope.data = [{x: 0, value: 4}, {x: 1, value: 8}];

      scope.options = {series: [
        {y: 'value', color: '#4682b4', label: 'toto'},
        {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
      ]};
    });
  });

  it('should create legend elements', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;

    var legendGroup = content[5];
    expect(legendGroup.getAttribute('class')).toBe('legend');

    expect(legendGroup.childNodes.length).toBe(2);

    var l_0 = legendGroup.childNodes[0];
    expect(l_0.getAttribute('class')).toBe('legendItem');

    expect(l_0.childNodes[0].nodeName).toBe('circle');
    expect(l_0.childNodes[0].getAttribute('fill')).toBe('#4682b4');

    var e = document.createEvent("MouseEvents");
    e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    l_0.childNodes[0].dispatchEvent(e);

    l_0.childNodes[0].dispatchEvent(e);
  });
});
