module.exports = function(gulp, $, paths) {
  // Submit code coverage to Coveralls
  gulp.task('coveralls', ['clean:coverage'], function() {
    gulp.src(paths.coverage.to + '**/lcov.info')
      .pipe($.coveralls());
  });
};
