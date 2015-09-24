var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var abs = require('path').resolve;

// Absolute paths (sub tasks are one folder deeper than this file)
var paths = {
  source: {from: abs('src/**/*.ts'), to: abs('.tmp/build/')},
  style: {from: abs('src/**/*.scss'), to: abs('.tmp/build/')},
  test: {from: abs('test/**/*.ts'), to: abs('.tmp/test/')},
  spec: {config: abs('test/config/karma.conf.js'), from: abs('test/**/*.spec.ts')},
  e2e: {config: abs('test/config/protractor.conf.js'), from: abs('test/**/*.e2e.ts')},
  coverage: {to: abs('.tmp/coverage/')}
};

require('./gulp-tasks')(gulp, $, paths);

var isWatching = false;

// Extensive watch on the source and unit test files
var watchTasks = ['ts:lint:source', 'ts:lint:spec', 'ts:compile:source', 'test:spec', 'scss:copy'];
gulp.task('watch', watchTasks, function () {
  isWatching = true;
  gulp.watch([paths.source.from, paths.test.from, paths.style.from], [watchTasks])
});

// Serves files via `gulp serve`
gulp.task('serve', function(callback){
  isWatching = true;
  return runSequence(
    ['ts:compile:source', 'scss:copy', 'jinja:compile:e2e'],
    ['server'],
    callback);
});

// Builds the library and runs unit tests
gulp.task('build', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['ts:lint:source', 'ts:compile:source', 'scss:copy'],
    ['ts:lint:spec', 'test:spec'],
  callback);
});

// Builds the library, runs unit and integration tests
// and reports the coverage to Coveralls
gulp.task('travis', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['ts:lint:source', 'ts:compile:source', 'scss:copy'],
    ['ts:lint:spec', 'test:spec'],
    ['ts:lint:e2e', 'test:e2e'],
    'coveralls',
  callback);
});

// Workaround to stop gulp after async task
// https://github.com/gulpjs/gulp/issues/167
gulp.on('stop', function() {
  if (!isWatching) {
    process.nextTick(function() {
      process.exit(0);
    });
  }
});

// Default task running `gulp`
gulp.task('default', ['build']);
