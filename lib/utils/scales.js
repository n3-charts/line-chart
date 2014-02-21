createAxes: function(svg, dimensions, axesOptions) {
  var drawY2Axis = axesOptions.y2 !== undefined;

  var width = dimensions.width;
  var height = dimensions.height;

  width = width - dimensions.left - dimensions.right;
  height = height - dimensions.top - dimensions.bottom;

  var x = axesOptions.x.type === 'date' ?
    d3.time.scale().rangeRound([0, width]) :
    d3.scale.linear().rangeRound([0, width]);

  var y = axesOptions.y.type === 'log'
    ? d3.scale.log().clamp(true).rangeRound([height, 0])
    : d3.scale.linear().rangeRound([height, 0]);
  
  var y2 = (drawY2Axis && axesOptions.y2.type === 'log')
    ? d3.scale.log().clamp(true).rangeRound([height, 0])
    : d3.scale.linear().rangeRound([height, 0]);

  var xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(axesOptions.x.labelFunction);
  var yAxis = d3.svg.axis().scale(y).orient('left');
  var y2Axis = d3.svg.axis().scale(y2).orient('right');

  var style = function(group) {
    group.style({
      'font': '10px monospace',
      'shape-rendering': 'crispEdges'
    });
    
    group.selectAll('path').style({
      'fill': 'none',
      'stroke': '#000'
    });
  };
  
  var that = this;

  return {
    xScale: x,
    yScale: y,
    y2Scale: y2,
    xAxis: xAxis,
    yAxis: yAxis,
    y2Axis: y2Axis,

    andAddThemIf: function(isThumbnail) {
      if (!isThumbnail) {
        style(svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis));

        style(svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis));

        if (drawY2Axis) {
          style(svg.append('g')
            .attr('class', 'y2 axis')
            .attr('transform', 'translate(' + width + ', 0)')
            .call(y2Axis));
        }
      }

      return {
        xScale: x, yScale: y, y2Scale: y2,
        xAxis: xAxis, yAxis: yAxis, y2Axis: y2Axis
      };
    }
  };
},

setScalesDomain: function(scales, data, series, svg, axesOptions) {
  this.setXScale(scales.xScale, data, series, axesOptions);

  var ySeries = series.filter(function(s) { return s.axis !== 'y2'; });
  var y2Series = series.filter(function(s) { return s.axis === 'y2'; });
  
  var yDomain = this.yExtent(ySeries, data);
  if (axesOptions.y.type === 'log') {
    yDomain[0] = yDomain[0] === 0 ? 0.001 : yDomain[0];
  }
  
  var y2Domain = this.yExtent(y2Series, data);
  if (axesOptions.y2 && axesOptions.y2.type === 'log') {
    y2Domain[0] = y2Domain[0] === 0 ? 0.001 : y2Domain[0];
  }
  
  scales.yScale.domain(yDomain).nice();
  scales.y2Scale.domain(y2Domain).nice();

  svg.selectAll('.x.axis').call(scales.xAxis);
  svg.selectAll('.y.axis').call(scales.yAxis);
  svg.selectAll('.y2.axis').call(scales.y2Axis);
},

yExtent: function(series, data) {
  var minY = Number.POSITIVE_INFINITY;
  var maxY = Number.NEGATIVE_INFINITY;

  series.forEach(function(s) {
    minY = Math.min(minY, d3.min(data, function(d) { return d[s.y]; }));
    maxY = Math.max(maxY, d3.max(data, function(d) { return d[s.y]; }));
  });

  return [minY, maxY];
},

setXScale: function(xScale, data, series, axesOptions) {
  xScale.domain(d3.extent(data, function(d) { return d[axesOptions.x.key]; }));

  if (series.filter(function(s) { return s.type === 'column'; }).length) {
    this.adjustXScaleForColumns(xScale, data, axesOptions.x.key);
  }
},

adjustXScaleForColumns: function(xScale, data, field) {
  var step = this.getAverageStep(data, field);
  var d = xScale.domain();

  if (angular.isDate(d[0])) {
    xScale.domain([new Date(d[0].getTime() - step), new Date(d[1].getTime() + step)]);
  } else {
    xScale.domain([d[0] - step, d[1] + step]);
  }
},

getAverageStep: function(data, field) {
  var sum = 0;
  var n = data.length - 1;

  for (var i = 0; i<n; i++) {
    sum += data[i + 1][field] - data[i][field];
  }

  return sum/n;
},

haveSecondYAxis: function(series) {
  var doesHave = false;

  angular.forEach(series, function(s) {
    doesHave = doesHave || s.axis === 'y2';
  });

  return doesHave;
}
