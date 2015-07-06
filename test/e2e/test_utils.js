beforeEach(function() {
  this.addMatchers({
    toHaveExactClass: function(expected) {
      var self = this;
      var deferred = protractor.promise.defer();

      self.actual.getAttribute('class').then(function(classes) {
        if (classes === expected) {
          deferred.fulfill(true);
        } else {
          deferred.reject('class "' + classes + '" should be "' + expected + '"');
        }
      });

      return deferred.promise;
    },

    toContainClass: function (expected) {
      var self = this;
      var deferred = protractor.promise.defer();

      self.actual.getAttribute('class').then(function(classes) {
        if (classes && classes.indexOf(expected) > -1) {
          deferred.fulfill(true);
        } else {
          deferred.reject(classes + ' did not contain class ' + expected);
        }
      });

      return deferred.promise;
    },
    toNotContainClass: function (expected) {
      var self = this;
      var deferred = protractor.promise.defer();

      self.actual.getAttribute('class').then(function(classes) {
        if (classes && classes.indexOf(expected) > -1) {
          deferred.reject(classes + ' did contain class ' + expected);
        } else {
          deferred.fulfill(true);
        }
      });

      return deferred.promise;
    }
  });
});
