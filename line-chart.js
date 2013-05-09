angular.module('n3-charts.linechart', [])

.factory('lineUtil', function() {
  return {
    bootstrap: function(width, height, element) {
      d3.select(element).classed('linechart', true);
      
      var margin = {top: 20, right: 50, bottom: 30, left: 50};
      
      width = width - margin.left - margin.right;
      height = height - margin.top - margin.bottom;
      
      var svg = d3.select(element).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      
      return svg;
    },
    
    getTooltipTextWidth: function(text) {
      return Math.max(25, text.length*6.5);
    },
    
    getYTooltipPath: function(text) {
      var w = this.getTooltipTextWidth(text);
      var h = 18;
      var p = 5;
      
      return 'm0 0' +
        'l-' + p + ' -' + p + ' ' +
        'l0 -' + (h/2 - p) + ' ' +
        'l-' + w + ' 0 ' +
        'l0 ' + h + ' ' +
        'l' + w + ' 0 ' +
        'l0 -' + (h/2 - p) +
        'l-' + p + ' ' + p + 'z';
    },
    
    getXTooltipPath: function(text) {
      var w = this.getTooltipTextWidth(text);
      var h = 18;
      var p = 5;
      
      return 'm-' + w/2 + ' ' + p + ' ' +
        'l0 ' + h + ' ' +
        'l' + w + ' 0 ' +
        'l0 ' + '-' + h +
        'l-' + (w/2 - p) + ' 0 ' +
        'l-' + p + ' -' + h/4 + ' ' +
        'l-' + p + ' ' + h/4 + ' ' +
        'l-' + (w/2 - p) + ' 0z';
    },
    
    addAxes: function(svg, width, height) {
      var margin = {top: 20, right: 50, bottom: 30, left: 50};
      
      width = width - margin.left - margin.right;
      height = height - margin.top - margin.bottom;
      
      var x = d3.scale.linear().rangeRound([0, width]);
      var y = d3.scale.linear().rangeRound([height, 0]);
      
      var xAxis = d3.svg.axis().scale(x).orient('bottom');
      var yAxis = d3.svg.axis().scale(y).orient('left');
      
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
      
      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      
      
      var w = 24;
      var h = 18;
      var p = 5;
      
      var xTooltip = svg.append('g')
        .attr({
          'id': 'xTooltip',
          'opacity': 0
        });
      
      xTooltip.append('path')
        .attr({
          'fill': 'grey',
          'transform': 'translate(0,' + (height + 1) + ')'
        });
      
      xTooltip.append('text')
        .style({
          'text-anchor': 'middle'
        })
        .attr({
          'width': w,
          'height': h,
          'font-family': 'monospace',
          'font-size': 10,
          'transform': 'translate(0,' + (height + 19) + ')',
          'fill': 'white',
          'text-rendering': 'geometric-precision'
        });
      
      var yTooltip = svg.append('g')
        .attr({
          'id': 'yTooltip',
          'opacity': 0
        });
      
      yTooltip.append('path')
        .attr('fill', 'grey');
      
      yTooltip.append('text')
        .style({
          // 'text-anchor': 'middle'
        })
        .attr({
          'width': h,
          'height': w,
          'font-family': 'monospace',
          'font-size': 10,
          'fill': 'white',
          'text-rendering': 'geometric-precision'
        })
        .text('28');
      
      return {
        xScale: x, yScale: y,
        xAxis: xAxis, yAxis: yAxis
      }
    },
    
    removeContent: function(svg) {
      svg.selectAll('.content').remove();
    },
    
    createContent: function(svg) {
      svg.append('g')
        .attr('class', 'content');
    },
    
    createLineDrawer: function(scales) {
      return d3.svg.line()
        .x(function(d) {return scales.xScale(d.x);})
        .y(function(d) {return scales.yScale(d.value);});
    },
    
    drawLines: function(svg, drawer, data) {
      svg.select('.content').selectAll('.lineGroup')
        .data(data) .enter().append('g')
          .style('stroke', function(serie) {return serie.color;})
          .attr('class', 'lineGroup')
          .append('path')
            .attr('class', 'line')
            .attr('d', function(d) {return drawer(d.values);})
    },
    
    drawDots: function(svg, data, scales) {
      var that = this;
      
      svg.select('.content').selectAll('.dotGroup')
        .data(data).enter().append('g')
          .attr('class', 'dotGroup')
          .attr('fill', function(s) {return s.color;})
          .on('mouseover', function(s) {
            var target = d3.select(d3.event.target);
            
            target.attr('r', 4);
            
            var textX = '' + target.datum().x;
            
            var xTooltip = d3.select("#xTooltip")
              .transition()
              .attr({
                'opacity': 1.0,
                'transform': 'translate(' + target.attr('cx') + ',0)'
              })
            xTooltip.select('text').text(textX)
            xTooltip.select('path')
              .attr('fill', s.color)
              .attr('d', that.getXTooltipPath(textX));
            
            var yTooltip = d3.select("#yTooltip")
              .transition()
              .attr({
                'opacity': 1.0,
                'transform': 'translate(0, ' + target.attr('cy') + ')'
              })
            
            var textY = '' + target.datum().value;
            
            var yTooltipText = yTooltip.select('text')
              .text(textY);
            
            yTooltipText.attr(
              'transform',
              'translate(-' + (that.getTooltipTextWidth(textY) + 2) + ',3)'
            );
            
            yTooltip.select('path')
              .attr('fill', s.color)
              .attr('d', that.getYTooltipPath(textY));
          })
          .on('mouseout', function(d) {
            d3.select(d3.event.target).attr('r', 2);
            
            d3.select("#xTooltip")
              .transition()
              .attr({
                'opacity': .0
              })
            
            d3.select("#yTooltip")
              .transition()
              .attr({
                'opacity': .0
              })
          })
          .selectAll('.dot').data(function(d) {return d.values;})
            .enter().append('circle')
            .attr({
              'class': 'dot',
              'r': 2,
              'cx': function(d) {return scales.xScale(d.x)},
              'cy': function(d) {return scales.yScale(d.value)}
            })
        
    },
    
    getLineData: function(data, options) {
      var series = options ? options.series : null;
      
      if (!series || !series.length || !data || !data.length) {
        return [];
      } 
      
      var lineData = [];
      
      series.forEach(function(s) {
        var seriesData = {name: s.y, values: [], color: s.color};
        
        data.forEach(function(row) {
          seriesData.values.push({x: row.x, value: row[s.y]})
        });
        
        lineData.push(seriesData);
      });
      
      return lineData;
    },
    
    setScalesDomain: function(scales, data, series, svg) {
      scales.xScale.domain(d3.extent(data, function(d) {return d.x;}));
      scales.yScale.domain(this.yExtent(series, data)).nice();
      
      svg.selectAll('.x.axis').call(scales.xAxis)
      svg.selectAll('.y.axis').call(scales.yAxis)
    },
    
    yExtent: function(series, data) {
      var minY = Number.POSITIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;
      
      series.forEach(function(s) {
        minY = Math.min(minY, d3.min(data, function(d) {return d[s.y]}));
        maxY = Math.max(maxY, d3.max(data, function(d) {return d[s.y]}));
      });
      
      return [minY, maxY];
    }
  }
})

.directive('linechart', ['lineUtil', function(lineUtil) {
  var link  = function(scope, element, attrs, ctrl) {
    var height = 500;
    var width = 900;
    
    var svg = lineUtil.bootstrap(width, height, element[0]);
    var axes = lineUtil.addAxes(svg, width, height);
    
    
    var lineDrawer = lineUtil.createLineDrawer(axes);
    
    scope.redraw = function() {
      var data = scope.data;
      var options = scope.options;
      
      lineUtil.removeContent(svg);
      lineUtil.createContent(svg);
      
      var lineData = lineUtil.getLineData(data, options)
      
      if (lineData.length > 0) {
        
        lineUtil.setScalesDomain(axes, data, options.series, svg);
        
        lineUtil.drawLines(svg, lineDrawer, lineData);
        lineUtil.drawDots(
          svg,
          lineData,
          axes,
          d3.select(element[0]).select('#tooltip')
        );
      }
    }
    
    scope.$watch('data + options', scope.redraw);
  };
  
  return {
    replace: true,
    restrict: 'E',
    scope: {data: '=', options: '='},
    template: '<div></div>',
    link: link
  };
}]);