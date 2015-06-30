
var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var karma = require('karma').server;

var paths = {
  e2e: {
    from: 'test/e2e/test_cases/**/spec.js'
  },
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
    return gulp.src(['.tmp/', 'test/coverage/'], {read: false})
      .pipe($.clean());
});

gulp.task('clean:build', function () {
    return gulp.src(['build/'], {read: false})
      .pipe($.clean());
});

gulp.task('tslint', function () {
    return gulp.src(paths.source.from)
      .pipe($.tslint()).pipe($.tslint.report('prose'));
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

gulp.task('test', ['compile:tests'], function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function() {done()});
});

gulp.task('e2e', function() {
  return gulp.src(["./test/e2e/test_utils.js", "./test/e2e/test_cases/**/spec.js"])
    .pipe($.protractor.protractor({
      configFile: "./test/e2e/protractor.config.js"
    }))
    .on('error', function() {})
});

var watchTasks = ['compile:source:concat', 'test', 'e2e'];
gulp.task('watch', watchTasks, function () {
  gulp.watch([paths.tests.from, paths.source.from, paths.e2e.from], [watchTasks])
});

gulp.task('quick-watch', ['compile:source:concat'], function () {
  gulp.watch([paths.source.from], [['compile:source:concat']])
});

gulp.task('coveralls', function() {
  gulp.src('test/coverage/**/lcov.info')
    .pipe($.coveralls());
});

gulp.task('default', ['build']);

gulp.task('build', function(callback) {
  return runSequence(
    ['clean:tmp', 'clean:build'],
    ['tslint', 'compile:source:concat'],
    ['test', 'e2e'],
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
