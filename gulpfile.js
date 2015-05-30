
var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

var paths = {
  tests: {
    from: 'test/**/*.mocha.ts',
    to: '.tmp/'
  },
  source: {
    from: 'src/**/*.ts',
    to: 'build/',
    to_pattern: 'build/**/*.js'
  }
};

gulp.task('clean:tmp', function () {
    return gulp.src(['.tmp/', 'coverage/'], {read: false})
      .pipe($.clean());
});

gulp.task('clean:build', function () {
    return gulp.src(['build/'], {read: false})
      .pipe($.clean());
});

gulp.task('tslint', function () {
    return gulp.src(paths.source.from).pipe($.tslint()).pipe($.tslint.report('prose'));
});

gulp.task('compile:source', function () {
  return gulp
  .src(paths.source.from)
  .pipe($.typescript({
    module: 'CommonJS',
    sourcemap: true
  }))
  .pipe(gulp.dest(paths.source.to));
});

gulp.task('compile:source:concat', function () {
  return gulp
  .src(paths.source.from)
  .pipe($.typescript({
    module: 'CommonJS',
    out: 'LineChart.js'
  }))
  .pipe(gulp.dest(paths.source.to));
});

gulp.task('compile:tests', function () {
  return gulp
  .src(paths.tests.from)
  .pipe($.typescript({
    module: 'CommonJS',
    sourcemap: true
  }))
  .pipe(gulp.dest(paths.tests.to));
});

gulp.task('test', ['compile:tests'], function() {
  return gulp.src([
    'node_modules/expect.js/index.js',
    'node_modules/angular/angular.js',
    'node_modules/angular-mocks/angular-mocks.js',
    'node_modules/d3/d3.min.js',
    'build/LineChart.js',
    paths.tests.to + 'unit/**/*.js'
  ]).pipe($.karma({
    configFile: 'karma.conf.js',
    action: 'run',
    preprocessors: {'build/LineChart.js': ['coverage']}
  }))
  .on('error', function() {})
});

gulp.task('watch', ['compile:source:concat', 'test'], function () {
  gulp.watch([paths.tests.from, paths.source.from], [['compile:source:concat', 'test']])
});

gulp.task('coveralls', function() {
  gulp.src('coverage/**/lcov.info')
    .pipe($.coveralls());
});

gulp.task('default', ['build']);

gulp.task('build', function(callback) {
  return runSequence(
    ['clean:tmp', 'clean:build'],
    ['tslint', 'compile:source:concat'],
    'test',
  callback);
});

gulp.task('travis', function(callback) {
  return runSequence(
    ['clean:tmp', 'clean:build'],
    ['tslint', 'compile:source:concat'],
    'test',
    'coveralls',
  callback);
});
