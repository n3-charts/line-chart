angular.module('utils', [])

.factory('appUtils', function() {
  return {
    positiveData: function(rowCount, seriesCount) {
      var data = [];

      for (var i = 0; i < seriesCount; i++) {
        for (var j = 0; j < rowCount; j++) {
          var row = data[j] || {x: j};
          row['val_' + i] = Math.abs(Math.round(Math.sin((i+1)*j/5)*(5*(i+1))*1000)/1000);
          data[j] = row;
        }
      }
      return data;
    },

    linearData: function(rowCount, seriesCount) {
      var data = [];

      for (var i = 0; i < seriesCount; i++) {
        for (var j = 0; j < rowCount; j++) {
          var row = data[j] || {x: j};
          row['val_' + i] = Math.round(Math.sin((i+1)*j/5)*(5*(i+1))*1000)/1000;
          data[j] = row;
        }
      }

      return data;
    },

    logarithmicData: function(rowCount, seriesCount) {
      var data = [];

      for (var i = 0; i < seriesCount; i++) {
        for (var j = 0; j < rowCount; j++) {
          var row = data[j] || {x: j};
          row['val_' + i] = Math.abs((i+1)*100000 + parseInt(Math.cos(j)*200000));
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
          row['val_' + i] = Math.round(Math.sin((i+1)*j/5)*(5*(i+1))*1000)/1000;
          data[j] = row;
        }
      }

      return data;
    }
  };
})

angular.module('examples', ['apojop', 'utils'])

.controller('ExamplesCtrl', function($scope, appUtils) {
  mixpanel.track('Examples', {version: 'v1'});
  var colors = d3.scale.category10();
  $scope.max = 30;

  var linData = appUtils.linearData($scope.max, 4);
  var timData = appUtils.timedData($scope.max, 4);
  var logData = appUtils.logarithmicData($scope.max, 4);
  var posData = appUtils.positiveData($scope.max, 4);

  $scope.crop = function(example) {
    example.data = example.originData.slice(0, example.visibleRows);
  };

  $scope.examples = [
    {
      label: 'Linear series',
      dataType: 'linear',
      data: linData,
      options: {series: [
        {y: 'val_0', label: 'A line sinusoid', color: colors(0)},
        {y: 'val_0', label: 'A column sinusoid', color: colors(1), type: 'column'},
        {y: 'val_0', label: 'An area sinusoid', color: colors(2), type: 'area'}
      ]}
    },

    {
      label: 'Log series',
      dataType: 'logarithmic',
      data: logData,
      options: {axes: {x: {key: 'x', labelFunction: function(v) {return 'Na';}}, y: {type: 'log'}},
        series: [{y: 'val_0', label: 'Batmaaan', color: colors(4)}]
      }
    },
    {
      label: 'Time series',
      dataType: 'timed',
      data: timData,
      options: {
        axes: {x: {type: 'date'}},
        series: [{y: 'val_0', label: 'A time series', color: colors(9)}],
        tooltip: {mode: 'scrubber', formatter: function(x, y, series) {
      return moment(x).fromNow() + ' : ' + y;
    }}
      }
    },
    {
      label: 'Area series',
      dataType: 'linear',
      data: linData,
      options: {series: [{y: 'val_0', label: 'A colorful area series', color: colors(1), type: 'area'}]}
    },
    {
      label: 'Column series',
      dataType: 'linear',
      data: linData,
      options: {series: [{y: 'val_0', label: 'The best column series ever', color: colors(2), type: 'column'}]}
    },

    {
      label: 'Two axes',
      dataType: 'linear',
      data: linData,
      options: {series: [
        {y: 'val_0', label: 'On the left !', color: colors(3)},
        {y: 'val_1', axis: 'y2', label: 'On the right !', color: colors(4)}
      ]}
    },

    {
      label: 'Interpolation',
      dataType: 'linear',
      data: linData,
      options: {lineMode: 'bundle', series: [
      {y: 'val_0', label: 'Ping', color: colors(5)},
      {y: 'val_2', label: 'Pong', axis: 'y2', color: colors(6)}
      ]}
    },

    {
      label: 'Several series',
      dataType: 'linear',
      data: linData,
      options: {lineMode: 'cardinal', series: [
      {y: 'val_0', label: 'This', type: 'area', color: colors(7)},
      {y: 'val_1', label: 'Is', type: 'column', color: colors(8)},
      {y: 'val_2', label: 'Awesome', color: colors(9)}
      ]}
    },

    {
      label: 'Striped areas',
      dataType: 'linear',
      data: linData,
      options: {lineMode: 'cardinal', series: [
      {y: 'val_0', label: 'Stripes', type: 'area', striped: true, color: colors(10)},
      {y: 'val_1', label: 'Are', type: 'area', striped: true, color: colors(14)},
      {y: 'val_2', label: 'Sweet', type: 'area', striped: true, color: colors(18)}
      ]}
    },

    {
      label: 'Stacked column series',
      dataType: 'positive',
      data: posData,
      options: {stacks: [{axis: 'y', series: ['id_0', 'id_1', 'id_2']}], lineMode: 'cardinal', series: [
      {id: 'id_0', y: 'val_0', label: 'Foo', type: 'column', color: colors(10)},
      {id: 'id_1', y: 'val_1', label: 'Bar', type: 'column', color: colors(14)},
      {id: 'id_2', y: 'val_2', label: 'Baz', type: 'column', color: colors(16)},
      ]}
    },

    {
      label: 'Stacked areas series',
      dataType: 'positive',
      data: posData,
      options: {stacks: [{axis: 'y', series: ['id_0', 'id_1', 'id_2']}], lineMode: 'cardinal', series: [
      {id: 'id_0', y: 'val_0', label: 'Foo', type: 'area', color: colors(10)},
      {id: 'id_1', y: 'val_1', label: 'Bar', type: 'area', color: colors(14)},
      {id: 'id_2', y: 'val_2', label: 'Baz', type: 'area', color: colors(16)},
      ]}
    }
  ];

  $scope.examples.forEach(function(e) {
    e.pristineOptions = angular.copy(e.options);
  });
});
