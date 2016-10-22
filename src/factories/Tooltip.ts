import * as d3 from 'd3';

import * as Utils from '../utils/_index';
import * as Options from '../options/_index';

import { BaseFactory } from './BaseFactory';
import { Container, ICoordinates } from './Container';

export interface INeighbour {
  row: any;
  series: Options.SeriesOptions;
}

export class Tooltip extends BaseFactory {

  private svg: d3.Selection<any, any, any, any>;
  private line: d3.Selection<any, any, any, any>;
  private dots: d3.Selection<any, any, any, any>;

  private options: Options.Options;

  constructor(private element: HTMLElement) {
    super();
  }

  off() {
    super.off();
    this.hide();
  }

  create(options: Options.Options) {
    this.options = options;

    this.createTooltip();
    this.eventMgr.on('container-move.tooltip', this.show.bind(this));
    this.eventMgr.on('container-out.tooltip', this.hide.bind(this));
    this.eventMgr.on('container-tap.tooltip', this.show.bind(this));
    this.eventMgr.on('outer-world-hover.tooltip', this.showFromCoordinates.bind(this));

    this.hide();
  }

  update(data: Utils.Data, options: Options.Options) {
    this.options = options;
  }

  createTooltip() {
    var svg = this.svg = d3.select(this.element)
      .append('div')
        .attr('class', 'chart-tooltip');

    svg.append('div')
      .attr('class', 'abscissas');

    this.line = this.factoryMgr.get('container').overlay
      .append('line')
        .attr('class', 'tooltip-line');

    this.dots = this.factoryMgr.get('container').overlay
      .append('g')
        .attr('class', 'tooltip-dots');
  }

  destroy() {
    this.svg.remove();
  }

  getClosestRows(x: number, data: Utils.Data, options: Options.Options): {rows: INeighbour[], index: number} {
    var visibleSeries = options.series.filter((series) => series.visible);
    var datasets = visibleSeries.map((series) => data.getDatasetValues(series, options).filter(series.defined));

    var closestRows = [];
    var closestIndex = -1;
    var minDistance = Number.POSITIVE_INFINITY;
    var foundSeries: Options.ISeriesOptions[] = [];

    for (var i = 0; i < datasets.length; i++) {
      for (var j = 0; j < datasets[i].length; j++) {
        if (options.axes.x.type === 'date') {

          // _sigh_ TypeScript...
          var distance = Math.abs((<any>datasets[i][j].x).getTime() - x);
        } else {
          var distance = Math.abs(datasets[i][j].x - x);
        }

        let series = visibleSeries[i];
        if (distance === minDistance && foundSeries.indexOf(series) === -1) {
          closestRows.push({series, row: datasets[i][j]});
          foundSeries.push(series);
        } else if (distance < minDistance) {
          minDistance = distance;
          closestRows = [{series: visibleSeries[i], row: datasets[i][j]}];
          foundSeries = [series];
          closestIndex = j;
        }
      }
    }

    return {rows: closestRows, index: closestIndex};
  }

  showFromCoordinates(coordinates: ICoordinates, data: Utils.Data, options: Options.Options) {
    if (this.isOff()) {
      return;
    }

    var {x, y} = coordinates;

    if (x === undefined || y === undefined) {
      this.hide(undefined, data, options);
      return;
    }


    if (x instanceof Date) {
      // _sigh_ TypeScript...
      x = (<Date>x).getTime();
    }

    var {rows, index} = this.getClosestRows(<number>x , data, options);
    if (rows.length === 0) {
      this.hide(undefined, data, options);
      return;
    }

    this.updateTooltipDots(rows);
    this.dots.style('opacity', '1');

    this.updateLinePosition(rows);
    this.line.style('opacity', '1');

    var tooltipContent = this.getTooltipContent(rows, index, options);

    if (options.tooltipHook) {
      tooltipContent = options.tooltipHook(rows);
    }

    if (!tooltipContent) {
      return;
    }

    this.updateTooltipContent(tooltipContent, index, options);
    this.updateTooltipPosition(rows);
    this.svg.style('display', null);
  }


  show(event: any, data: Utils.Data, options: Options.Options) {
    if (this.isOff()) {
      return;
    }

    var container: Container = this.factoryMgr.get('container');
    var coordinates = container.getCoordinatesFromEvent(event);

    this.showFromCoordinates(coordinates, data, options);
  }

  hide(event?: any, data?: Utils.Data, options?: Options.Options) {
    this.svg
      .style('display', 'none');

    this.line
      .style('opacity', '0');

    this.dots
      .style('opacity', '0');

    if (options && options.tooltipHook) {
      options.tooltipHook(undefined);
    }
  }

  // This is the part the user can override.
  getTooltipContent(rows: INeighbour[], closestIndex: number, options: Options.Options) {
    var xTickFormat = options.getByAxisSide(Options.AxisOptions.SIDE.X).tickFormat;
    var getYTickFormat = (side: string) => options.getByAxisSide(side).tickFormat;

    var getRowValue = (d: INeighbour) => {
      var yTickFormat = getYTickFormat(d.series.axis);

      var fn = yTickFormat ? (y1) => yTickFormat(y1, closestIndex) : (y1) => y1;
      var y1Label = fn(d.row.y1);

      if (d.series.hasTwoKeys()) {
        return '[' + fn(d.row.y0) + ', ' + y1Label + ']';
      } else {
        return y1Label;
      }
    };

    return {
      abscissas: xTickFormat ? xTickFormat(rows[0].row.x, closestIndex) : rows[0].row.x,
      rows: rows.map(function(row: INeighbour) {
        return {
          label: row.series.label,
          value: getRowValue(row),
          color: row.series.color,
          id: row.series.id
        };
      })
    };
  }

  updateTooltipContent(result: any, closestIndex: number, options: Options.Options) {
    this.svg.select('.abscissas')
      .text(result.abscissas);

    var init = (_items) => {
      _items.attr('class', 'tooltip-item');

      _items.append('div')
        .attr('class', 'color-dot')
        .style('background-color', (d) => d.color);

      _items.append('div')
        .attr('class', 'series-label');

      _items.append('div')
        .attr('class', 'y-value');
    };

    var update = (_items) => {
      _items.select('.series-label')
        .text((d) => d.label);

      _items.select('.y-value')
        .text((d) => d.value);
    };

    var items = this.svg.selectAll('.tooltip-item')
      .data(result.rows, (d: any , i) => !!d.id ? d.id : i );

    items.call(update);

    items.enter()
        .append('div')
        .call(init)
      .merge(items)
        .call(update);

    items.exit().remove();
  }

  updateTooltipDots(rows: INeighbour[]) {
    var xScale = this.factoryMgr.get('x-axis').scale;
    var yScale = (side) => this.factoryMgr.get(side + '-axis').scale;

    const radius = 3;

    const init = (_dots) => {
      _dots.attr('class', 'tooltip-dots-group');

      _dots.append('circle')
        .attr('class', 'tooltip-dot y1')
        .on('click', (d: INeighbour, i) => {
          this.eventMgr.trigger('click', d.row, i, d.series, this.options);
        });

      _dots.append('circle')
        .attr('class', 'tooltip-dot y0')
        .style('display', (d) => d.series.hasTwoKeys() ? null : 'none')
        .on('click', (d: INeighbour, i) => {
          this.eventMgr.trigger('click', d.row, i, d.series, this.options);
        });
    };

    const update = (_dots) => {
      _dots.select('.tooltip-dot.y1')
        .attr('r', (d) => radius)
        .attr('cx', (d) => xScale(d.row.x))
        .attr('cy', (d) => yScale(d.series.axis)(d.row.y1))
        .attr('stroke', (d) => d.series.color)
      ;

      _dots.select('.tooltip-dot.y0')
        .attr('r', (d) => d.series.hasTwoKeys() ? radius : null)
        .attr('cx', (d) => d.series.hasTwoKeys() ? xScale(d.row.x) : null)
        .attr('cy', (d) => d.series.hasTwoKeys() ? yScale(d.series.axis)(d.row.y0) : null)
        .attr('stroke', (d) => d.series.hasTwoKeys() ? d.series.color : null)
      ;
    };

    var dots = this.dots.selectAll('.tooltip-dots-group')
      .data(rows);

    dots.call(update);

    dots.enter()
        .append('g')
        .call(init)
      .merge(dots)
        .call(update);

    dots.exit().remove();
  }

  updateTooltipPosition(rows: INeighbour[]) {
    var [lastRow] = rows.slice(-1);

    var xAxis = this.factoryMgr.get('x-axis');
    var yScale = this.factoryMgr.get('y-axis').scale;

    var margin = this.factoryMgr.get('container').getDimensions().margin;
    var leftOffset = this.element.offsetLeft;
    var topOffset = this.element.offsetTop;

    var xOffset = 0;
    var transform = '';

    if (xAxis.isInLastHalf(lastRow.row.x)) {
      transform = 'translate(-100%, 0)';
      xOffset = -10;
    } else {
      xOffset = 10;
    }

    this.svg
      .style('left', (leftOffset + margin.left + xAxis.scale(lastRow.row.x) + xOffset) + 'px')
      .style('top', (topOffset + margin.top) + 'px')
      .style('transform', transform)
    ;

    return;
  }

  updateLinePosition(rows: INeighbour[]) {
    var container = <Container> this.factoryMgr.get('container');
    var dim: Options.Dimensions = container.getDimensions();

    var [lastRow] = rows.slice(-1);

    var xAxis = this.factoryMgr.get('x-axis');

    var x = xAxis.scale(lastRow.row.x);

    this.line
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', -dim.margin.top)
      .attr('y2', dim.innerHeight)
    ;

    return;
  }
}
