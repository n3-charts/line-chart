angular.module('info', [])

.factory('version', function($q, $http) {
  var _version = undefined;
  var deferred = undefined;

  return {
    get: function() {
      if (_version !== undefined) {
        return {then: function(cb) {cb(_version)}};
      }

      if (deferred !== undefined) {
        return deferred.promise;
      }

      deferred = $q.defer();

      $http.get('https://api.github.com/repos/n3-charts/line-chart/tags').then(function(response) {
        var tags = response.data;
        _version = tags[0].name;
        deferred.resolve(_version);
      });

      return deferred.promise;
    }
  };
})

;
