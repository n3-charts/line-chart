var karma = require('karma').server;

module.exports = function(gulp, $, paths) {
  // Run the unit tests with karma
  gulp.task('test:spec', ['ts:compile:spec'], function(done) {
    karma.start({
      configFile: paths.spec.config,
      singleRun: true,
      coverageReporter: {
        type: 'lcovonly',
        dir: paths.coverage.to
      }
    }, function() {done()});
  });
};
