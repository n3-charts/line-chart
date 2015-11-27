angular.module('data', [])

.factory('datasets', function(generators) {
  return {
    timed: [],
    numerical: generators.linearData(10, 4),
    logarithmic: generators.logarithmicData(100, 4)
  }
})

.factory('generators', function() {
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
