module.exports = function(gulp, $, paths) {
  gulp.task('src:compile:angularjs', function () {
    return gulp
      .src(paths.source.root.angular)
      .pipe($.typescript({
        module: 'CommonJS',
        out: 'LineChart.js'
      }))
      .pipe(gulp.dest(paths.source.to))
      .pipe($.uglify())
      .pipe($.rename({extname: '.min.js'}))
      .pipe(gulp.dest(paths.source.to));

  });

  gulp.task('unit:compile', function () {
    return gulp
    .src(paths.spec.from)
    .pipe($.typescript({
      module: 'CommonJS',
      sourcemap: true
    }))
    .pipe(gulp.dest(paths.test.to));
  });
};
