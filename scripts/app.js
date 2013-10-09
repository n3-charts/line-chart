angular.module('myApp', ['n3-charts.linechart'])

.factory('appUtils', function() {
  return {
    linearData: function(rowCount, seriesCount) {
      var data = [];

      for (var i = 0; i < seriesCount; i++) {
        for (var j = 0; j < rowCount; j++) {
          var row = data[j] || {x: j};
          row['series_' + i] = Math.round(Math.sin((i+1)*j/5)*(5*(i+1))*1000)/1000;
          data[j] = row;
        
        }
      }
      
      return data;
    },
    
    timedData: function(rowCount, seriesCount) {
      var data = [];

      var t = new Date();
      t.setMonth(t.getMonth() - 1);
      t = t.getTime();

      for (var i = 0; i < seriesCount; i++) {
        for (var j = 0; j < rowCount; j++) {
          var row = data[j] || {x: new Date(t + j*3600*1000*24)};
          row['series_' + i] = Math.round(Math.sin((i+1)*j/5)*(5*(i+1))*1000)/1000;
          data[j] = row;
        }
      }

      return data;
    }
  };
})

.controller('DemoCtrl', function($scope, appUtils) {
  $scope.addExample = function(label, desc, data, options) {
    $scope.examples.push({
      label: label,
      data: data,
      description: desc || '',
      options: options,
      json: JSON.stringify(options, null, 2)
    });

    return $scope.addExample;
  };
  
  $scope.previous = function() {
    $scope.currentIndex = $scope.currentIndex === 0 ? $scope.examples.length - 1 : $scope.currentIndex - 1;
  }
  
  $scope.next = function() {
    $scope.currentIndex = ($scope.currentIndex + 1)%$scope.examples.length;
  };
  
  $scope.examples = []
  
  var colors = d3.scale.category10();
  
  $scope.addExample

      ('Linear series', 'Standard linear data is fully supported and can be displayed as lines, columns and areas.', appUtils.linearData(50, 1),
        {series: [{y: 'series_0', label: 'A simple sinusoid', color: colors(0)}]})

      ('Time series', 'Date objects are also accepted as abscissas values.', appUtils.timedData(100, 1),
        {axes: {
          x: {type: 'date', tooltipFormatter: function(d) {return moment(d).fromNow()}}
        },
        series: [{y: 'series_0', label: 'A time series', color: colors(9)}]}
        )

      ('Area series', 'Area series are fully supported.', appUtils.linearData(50, 1),
        {series: [{y: 'series_0', label: 'A colorful area series', color: colors(1), type: 'area'}]})

      ('Column series', 'Column series are fully suported too. The chart adjusts its x-axis so that columns are never cropped.', appUtils.linearData(50, 1),
        {series: [{y: 'series_0', label: 'The best column series ever', color: colors(2), type: 'column'}]})

      ('Two axes', 'Series can be represented on another axis, just say it in the options !', appUtils.linearData(50, 2),
        {series: [
          {y: 'series_0', label: 'On the left !', color: colors(3)},
          {y: 'series_1', axis: 'y2', label: 'On the right !', color: colors(4)}
          ]}
          )

      ('Interpolation', 'D3.js adds some eye-candy when asked, and it is awesome', appUtils.linearData(50, 5),
        {lineMode: 'bundle', series: [
        {y: 'series_0', label: 'Ping', color: colors(5)},
        {y: 'series_4', label: 'Pong', axis: 'y2', color: colors(6)}
        ]}
        )

      ('Several series', 'You can even mix series types !', appUtils.linearData(50, 5),
        {lineMode: 'cardinal', series: [
        {y: 'series_0', label: 'This', type: 'area', color: colors(7)},
        {y: 'series_4', label: 'Is', type: 'column', color: colors(8)},
        {y: 'series_4', label: 'Awesome', color: colors(9)}
        ]}
        );

  $scope.currentIndex = 0;
})