import * as d3 from 'd3';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Utils from '../utils/_index';
import * as Factory from '../factories/_index';
import * as Series from '../factories/series/_index';
import * as Symbols from '../factories/symbols/_index';
import * as Options from '../options/_index';
import { ReactSyncLayer as SyncLayer } from './SyncLayer';

window['LineChart'] = React.createClass({
  propTypes: {
    data: React.PropTypes.object,
    options: React.PropTypes.object,
    dimensions: React.PropTypes.object
  },

  updateAll: function() {
    this.options = new Options.Options(this.props.options);
    this.data = new Utils.Data(this.props.data);

    this.eventMgr.update(this.data, this.options);
    this.eventMgr.trigger('update', this.data, this.options);
  },

  updateData: function(_data) {
    if (!_data) {
      return;
    }

    this.data.fromJS(_data);
    this.factoryMgr.turnFactoriesOff(['transitions']);
    this.eventMgr.trigger('data-update', this.data, this.options);
    this.factoryMgr.turnFactoriesOn(['transitions']);

    this.eventMgr.trigger('update', this.data, this.options);
  },

  handleResize: function(e) {
    var rect = ReactDOM.findDOMNode(this).parentElement.getBoundingClientRect();
    this.setState({
      height: rect.height,
      width: rect.width,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      top: rect.top
    });
    this.eventMgr.trigger('resize', ReactDOM.findDOMNode(this).parentElement);
  },

  componentDidMount: function() {
    var element = ReactDOM.findDOMNode(this);

    this.eventMgr = new Utils.EventManager();
    this.factoryMgr = new Utils.FactoryManager();

    this.eventMgr.init(Utils.EventManager.EVENTS);

    this.factoryMgr.registerMany([
      ['container', Factory.Container, element],
      ['tooltip', Factory.Tooltip, element],
      ['legend', Factory.Legend, element],
      ['transitions', Factory.Transition],
      ['x-axis', Factory.Axis, Options.AxisOptions.SIDE.X],
      ['x2-axis', Factory.Axis, Options.AxisOptions.SIDE.X2],
      ['y-axis', Factory.Axis, Options.AxisOptions.SIDE.Y],
      ['y2-axis', Factory.Axis, Options.AxisOptions.SIDE.Y2],
      ['grid', Factory.Grid],
      ['pan', Factory.Pan],
      ['zoom', Factory.Zoom],
      ['sync-layer', SyncLayer, this.props],

      // This order is important, otherwise it can mess up with the tooltip
      // (and you don't want to mess up with a tooltip, trust me).
      ['series-area', Series.Area],
      ['series-column', Series.Column],
      ['series-line', Series.Line],
      ['series-dot', Series.Dot],
      ['symbols-hline', Symbols.HLine],
      ['symbols-vline', Symbols.VLine]
    ]);

    this.factoryMgr.all().forEach((f) => f.instance.init(f.key, this.eventMgr, this.factoryMgr));

    this.eventMgr.trigger('create', this.props.options);

    this.updateAll();

    window.addEventListener('resize', Utils.FunctionUtils.debounce(this.handleResize, 50));

    this.eventMgr.on('legend-click.directive', (series) => {
      var foundSeries = this.options.series.filter((s) => s.id === series.id)[0];
      foundSeries.visible = series.getToggledVisibility();
      this.eventMgr.trigger('update', this.data, this.options);
    });

    this.eventMgr.on('pan.directive', () => {
      (<d3.Selection<SVGElement, any, any, any>>this.factoryMgr.get('container').svg).classed('panning', true);
    });
    this.eventMgr.on('pan-end.directive', () => {
      (<d3.Selection<SVGElement, any, any, any>>this.factoryMgr.get('container').svg).classed('panning', false);
    });
  },

  componentDidUpdate: function() {
    this.options = new Options.Options(this.props.options);
    this.data = new Utils.Data(this.props.data);

    this.eventMgr.update(this.data, this.options);
    this.eventMgr.trigger('update', this.data, this.options);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
    this.eventMgr.trigger('destroy');
  },

  render: function() {
    return React.createElement('div', null);
  }
});
