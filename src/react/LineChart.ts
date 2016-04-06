/// <reference path='../../typings/browser.d.ts' />

/// <reference path='../svg/_index.ts' />
/// <reference path='../options/_index.ts' />
/// <reference path='../utils/_index.ts' />
/// <reference path='../factories/_index.ts' />

/// <reference path='./SyncLayer.ts' />

var LineChart = React.createClass({
  propTypes: {
    data: React.PropTypes.object,
    options: React.PropTypes.object,
    dimensions: React.PropTypes.object
  },

  updateAll: function() {
    this.options = new n3Charts.Options.Options(this.props.options);
    this.data = new n3Charts.Utils.Data(this.props.data);

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

    this.eventMgr = new n3Charts.Utils.EventManager();
    this.factoryMgr = new n3Charts.Utils.FactoryManager();

    this.eventMgr.init(n3Charts.Utils.EventManager.EVENTS);

    this.factoryMgr.registerMany([
      ['container', n3Charts.Factory.Container, element],
      ['tooltip', n3Charts.Factory.Tooltip, element],
      ['legend', n3Charts.Factory.Legend, element],
      ['transitions', n3Charts.Factory.Transition],
      ['x-axis', n3Charts.Factory.Axis, n3Charts.Options.AxisOptions.SIDE.X],
      ['x2-axis', n3Charts.Factory.Axis, n3Charts.Options.AxisOptions.SIDE.X2],
      ['y-axis', n3Charts.Factory.Axis, n3Charts.Options.AxisOptions.SIDE.Y],
      ['y2-axis', n3Charts.Factory.Axis, n3Charts.Options.AxisOptions.SIDE.Y2],
      ['grid', n3Charts.Factory.Grid],
      ['pan', n3Charts.Factory.Pan],
      ['zoom', n3Charts.Factory.Zoom],
      ['sync-layer', n3Charts.Factory.ReactSyncLayer, this.props],

      // This order is important, otherwise it can mess up with the tooltip
      // (and you don't want to mess up with a tooltip, trust me).
      ['series-area', n3Charts.Factory.Series.Area],
      ['series-column', n3Charts.Factory.Series.Column],
      ['series-line', n3Charts.Factory.Series.Line],
      ['series-dot', n3Charts.Factory.Series.Dot],
      ['symbols-hline', n3Charts.Factory.Symbols.HLine],
      ['symbols-vline', n3Charts.Factory.Symbols.VLine]
    ]);

    this.factoryMgr.all().forEach((f) => f.instance.init(f.key, this.eventMgr, this.factoryMgr));

    this.eventMgr.trigger('create', this.props.options);

    this.updateAll();

    window.addEventListener('resize', n3Charts.Utils.FunctionUtils.debounce(this.handleResize, 50));

    this.eventMgr.on('legend-click.directive', (series) => {
      var foundSeries = this.options.series.filter((s) => s.id === series.id)[0];
      foundSeries.visible = series.getToggledVisibility();
      this.eventMgr.trigger('update', this.data, this.options);
    });

    this.eventMgr.on('pan.directive', () => {
      (<d3.Selection<SVGElement>>this.factoryMgr.get('container').svg).classed('panning', true);
    });
    this.eventMgr.on('pan-end.directive', () => {
      (<d3.Selection<SVGElement>>this.factoryMgr.get('container').svg).classed('panning', false);
    });
  },

  componentDidUpdate: function() {
    this.options = new n3Charts.Options.Options(this.props.options);
    this.data = new n3Charts.Utils.Data(this.props.data);

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
