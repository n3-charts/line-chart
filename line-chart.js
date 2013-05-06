angular.module('n3-charts.linechart', [])

.factory('lineUtil', function() {
  return {
    bootstrap: function(width, height, element) {
      var margin = {top: 20, right: 50, bottom: 30, left: 50};
      
      width = width - margin.left - margin.right;
      height = height - margin.top - margin.bottom;
      
      d3.select(element).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    }
  }
})

.directive('linechart', ['lineUtil', function(lineUtil) {
  var link  = function(scope, element, attrs, ctrl) {
    lineUtil.bootstrap(900, 500, element[0]);
  };
  
  return {
    restrict: "E",
    scope: {},
    template: '<div></div>',
    link: link
  };
}]);