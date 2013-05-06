angular.module('n3-charts.linechart', [])

.factory('lineUtil', function() {
  return {
    bootstrap: function(width, height, element) {
      var margin = {top: 20, right: 50, bottom: 30, left: 50};
      
      width = width - margin.left - margin.right;
      height = height - margin.top - margin.bottom;
      
      return d3.select(element).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    },
    
    addAxes: function(svg, width, height) {
      var margin = {top: 20, right: 50, bottom: 30, left: 50};
      
      width = width - margin.left - margin.right;
      height = height - margin.top - margin.bottom;
      
      var x = d3.scale.linear().range([0, width]);
      var y = d3.scale.linear().range([height, 0]);
      
      var xAxis = d3.svg.axis().scale(x).orient('bottom');
      var yAxis = d3.svg.axis().scale(y).orient('left');
      
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
      
      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      
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
        .data(data)
        .enter().append('g')
          .style('stroke', function(serie) {return serie.color;})
          .attr('class', 'lineGroup')
          .append('path')
            .attr('class', 'line')
            .attr('d', function(d) {return drawer(d.values);})
        
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
    
    setScalesDomain: function(scales, data, series) {
      scales.xScale.domain(d3.extent(data, function(d) {return d.x;}));
      scales.yScale.domain(this.yExtent(series, data)).nice();
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
        
        lineUtil.setScalesDomain(axes, data, options.series);
        
        lineUtil.drawLines(svg, lineDrawer, lineData);
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