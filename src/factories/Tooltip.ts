module n3Charts.Factory {
  'use strict';

  interface INeighbour {
    row: any;
    series: Utils.SeriesOptions;
  }

  export class Tooltip extends Utils.BaseFactory {

    private svg:D3.Selection;
    private line:D3.Selection;
    private dots:D3.Selection;

    constructor(private element: HTMLElement) {
      super();
    }

    create() {
      this.createTooltip();
      this.eventMgr.on('container-move.tooltip', this.show.bind(this));
      this.eventMgr.on('container-out.tooltip', this.hide.bind(this));

      this.hide();
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

    getCoordinates(event): {x?: number|Date, y?: number} {
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Utils.Dimensions = container.getDimensions();

      var {left, top} = event.currentTarget.getBoundingClientRect();

      var xScale = this.factoryMgr.get('x-axis').scale;
      var x = xScale.invert(event.pageX - left - dim.margin.left);

      var yScale = this.factoryMgr.get('y-axis').scale;
      var y = yScale.invert(event.pageY - top - dim.margin.top);

      if (y < yScale.domain()[0] || y > yScale.domain()[1]) {
        y = undefined;
      }

      if (x < xScale.domain()[0] || x > xScale.domain()[1]) {
        x = undefined;
      }

      return {y, x};
    }


    getClosestRows(x: number, data: Utils.Data, options: Utils.Options): {rows: INeighbour[], index:number} {
      var visibleSeries = options.series.filter((series) => series.visible);
      var datasets = visibleSeries.map((series) => data.getDatasetValues(series, options));

      var absKey = options.getAbsKey();

      var closestRows = [];
      var closestIndex = -1;
      var minDistance = Number.POSITIVE_INFINITY;

      for (var i = 0; i < datasets.length; i++) {
        for (var j = 0; j < datasets[i].length; j++) {
          var distance = Math.abs(datasets[i][j][absKey] - x);

          if (distance === minDistance) {
            closestRows.push({series: visibleSeries[i], row: datasets[i][j]});
          } else if (distance < minDistance) {
            minDistance = distance;
            closestRows = [{series: visibleSeries[i], row: datasets[i][j]}];
            closestIndex = j;
          }
        }
      }

      return {rows: closestRows, index: closestIndex};
    }

    updateTooltipContent(rows: INeighbour[], closestIndex: number, options: Utils.Options) {
      var x = rows[0].row[options.getAbsKey()];
      var xTickFormat = options.getByAxisSide(Utils.AxisOptions.SIDE.X).tickFormat;
      this.svg.select('.abscissas')
        .text('Abscissas : ' + (xTickFormat ? xTickFormat(x, closestIndex) : x));

      var initItem = (s) => {
        s.attr({'class': 'tooltip-item'});

        s.append('div')
          .attr({'class': 'color-dot'})
          .style({
            'background-color': (d) => d.series.color
          });

        s.append('div')
          .attr({'class': 'series-label'});

        s.append('div')
          .attr({'class': 'y-value'});

        return s;
      };

      var updateItem = (s) => {
        s.select('.series-label')
          .text((d) => d.series.label);
        var yTickFormat = options.getByAxisSide(Utils.AxisOptions.SIDE.Y).tickFormat;
        s.select('.y-value')
          .text((d) => yTickFormat ? yTickFormat(d.row.y1, closestIndex) : d.row.y1);

        return s;
      };

      var items = this.svg.selectAll('.tooltip-item')
        .data(rows, (d) => d.series.id);

      items.enter()
        .append('div')
        .call(initItem)
        .call(updateItem);

      items.call(updateItem);
      items.exit().remove();
    }

    show(event: any, data: Utils.Data, options: Utils.Options) {
      var {x, y} = this.getCoordinates(event);
      if (x === undefined || y === undefined) {
        this.hide();
        return;
      }

      if (x instanceof Date) {
        // _sigh_ TypeScript...
        x = (<Date>x).getTime();
      }

      var {rows, index} = this.getClosestRows(<number>x , data, options);
      if (rows.length === 0) {
        this.hide();
        return;
      }

      this.updateTooltipDots(rows);
      this.dots.style('opacity', '1');

      this.updateLinePosition(rows);
      this.line.style('opacity', '1');

      if (options.tooltipHook && options.tooltipHook(rows, data, options) === false) {
        return;
      }

      this.updateTooltipContent(rows, index, options);
      this.updateTooltipPosition(rows);

      this.svg
        .style('display', null);


      return;
    }

    updateTooltipDots(rows: INeighbour[]) {
      var xScale = this.factoryMgr.get('x-axis').scale;
      var yScale = this.factoryMgr.get('y-axis').scale;

      var initDots = (s) => {
        s.attr({
          'class': 'tooltip-dot',
          'r': 3
        });

      };

      var updateDots = (s) => {
        s.attr({
          'cx': (d) => xScale(d.row.x),
          'cy': (d) => yScale(d.row.y1),
          'stroke': (d) => d.series.color
        });
      };

      var dots = this.dots.selectAll('.tooltip-dot')
        .data(rows);

      dots.enter()
        .append('circle')
        .call(initDots)
        .call(updateDots);

      dots.call(updateDots);
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
        .style({
          'left': (leftOffset + margin.left + xAxis.scale(lastRow.row.x) + xOffset) + 'px',
          'top': (topOffset + margin.top) + 'px',
          'transform': transform
        });

      return;
    }

    updateLinePosition(rows: INeighbour[]) {
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Utils.Dimensions = container.getDimensions();

      var [lastRow] = rows.slice(-1);

      var xAxis = this.factoryMgr.get('x-axis');

      var x = xAxis.scale(lastRow.row.x);

      this.line.attr({
        'x1': x,
        'x2': x,
        'y1': 0,
        'y2': dim.innerHeight
      });

      return;
    }

    hide() {
      this.svg
        .style('display', 'none');

      this.line
        .style('opacity', '0');

      this.dots
        .style('opacity', '0');
    }
  }
}
