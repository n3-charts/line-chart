module.exports = function(gulp, $, paths) {
  // Compile the source files to JavaScript
  gulp.task('ts:compile:source', function () {
    return gulp
      .src(paths.source.from)
      .pipe($.typescript({
        module: 'CommonJS',
        out: 'LineChart.js'
      }))
      .pipe(gulp.dest(paths.source.to))
      .pipe($.uglify())
      .pipe($.rename({extname: '.min.js'}))
      .pipe(gulp.dest(paths.source.to));

  });

  // Compile the test files to JavaScript
  gulp.task('ts:compile:spec', function () {
    return gulp
    .src(paths.spec.from)
    .pipe($.typescript({
      module: 'CommonJS',
      sourcemap: true
    }))
    .pipe(gulp.dest(paths.test.to));
  });

  gulp.task('ts:compile:e2e', function () {
    return gulp
    .src(paths.e2e.from)
    .pipe($.typescript({
      module: 'CommonJS',
      sourcemap: true
    }))
    .pipe(gulp.dest(paths.test.to));
  });
};
