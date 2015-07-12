  /// <reference path='test.spec.ts' />

describe('LineChart directive', () => {
  beforeEach(module('testUtils'));
  beforeEach(module('n3-line-chart'));

  var element:any;
  var innerScope: any;
  var outerScope: any;

  beforeEach(inject((directive) => {
    var generated = directive.create(
      '<linechart ' +
      'on-datum-over="myOverCb" ' +
      'on-datum-out="myOutCb" ' +
      'data="myData" ' +
      'options="myOptions"' +
      '></linechart>'
    );

    element = generated.element;
    innerScope = generated.innerScope;
    outerScope = generated.outerScope;

    outerScope.$apply(function() {
      outerScope.myOverCb = sinon.spy();
      outerScope.myOutCb = sinon.spy();

      outerScope.myOptions = {
        series: [
          {
            axis: 'y',
            dataset: 'dataset0',
            visible: true,
            key: 'val_0',
            label: 'pouet',
            color: '#1f77b4',
            type: ['dot'],
            id: 'mySeries0'
          },
        ],
        axes: {x: {key: 'x'}}
      };

      outerScope.myData = {
        dataset0: [
          {x: 0, val_0: 0},
          {x: 1, val_0: 1}
        ]
      };
    });
  }));

  describe('events', () => {
    it('should have mouseover & mouseout', inject((fakeMouse) => {
      var dots = element.children('.dot');

      dots[0].mouseOver();
      expect(outerScope.myOverCb.callCount).to.equal(1);
      expect(outerScope.myOverCb.args[0]).to.eql([
        { x: 0, y: 0 }, 0, outerScope.myOptions.series[0]
      ]);

      dots[0].mouseOut();
      expect(outerScope.myOutCb.callCount).to.equal(1);
      expect(outerScope.myOutCb.args[0]).to.eql([
        { x: 0, y: 0 }, 0, outerScope.myOptions.series[0]
      ]);

      dots[1].mouseOver();
      expect(outerScope.myOverCb.callCount).to.equal(2);
      expect(outerScope.myOverCb.args[1]).to.eql([
        { x: 1, y: 1 }, 1, outerScope.myOptions.series[0]
      ]);

      dots[1].mouseOut();
      expect(outerScope.myOutCb.callCount).to.equal(2);
      expect(outerScope.myOutCb.args[1]).to.eql([
        { x: 1, y: 1 }, 1, outerScope.myOptions.series[0]
      ]);
    }));
  });
});
