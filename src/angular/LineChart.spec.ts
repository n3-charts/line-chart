/// <reference path='../test.spec.ts' />

describe('n3charts.LineChart', () => {
  beforeEach(module('testUtils'));
  beforeEach(module('n3-line-chart'));

  var element:any;
  var innerScope: any;
  var outerScope: any;

  beforeEach(inject((directive) => {
    var generated = directive.create(
      '<linechart ' +
      'on-datum-enter="myEnterCb" ' +
      'on-datum-over="myOverCb" ' +
      'on-datum-move="myMoveCb" ' +
      'on-datum-leave="myLeaveCb" ' +
      'data="myData" ' +
      'options="myOptions"' +
      '></linechart>'
    );

    element = generated.element;
    innerScope = generated.innerScope;
    outerScope = generated.outerScope;

    outerScope.$apply(function() {
      outerScope.myEnterCb = sinon.spy();
      outerScope.myOverCb = sinon.spy();
      outerScope.myMoveCb = sinon.spy();
      outerScope.myLeaveCb = sinon.spy();

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
});
