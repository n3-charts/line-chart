module.exports = function(gulp, $, paths) {
  // Submit code coverage to Coveralls
  gulp.task('coveralls', function() {
    gulp.src(paths.coverage.to + '.tmp/**/lcov.info')
      .pipe($.coveralls());
  });
};
