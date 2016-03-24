var gulp   = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var abs = require('path').resolve;

var paths = {
  source: {from: 'src/**/+([^.]).ts', to: '.tmp/build/'},
  style: {from: 'src/styles/**/*.scss', to: '.tmp/build/'},
  test: {from: 'src/**/*.spec.ts', to: '.tmp/test/'},
  spec: {config: abs('config/karma.conf.js'), from: 'src/**/*.spec.ts'},
  e2e: {
    config: 'config/protractor.conf.js',
    from: 'e2e/**/*.e2e.ts',
    templates: 'e2e/**/*.hjson',
    base: 'e2e/templates/_base.html',
    demo: 'e2e/templates/_demo.html'
  },
  coverage: {to: abs('.tmp/coverage/')}
};

require('./gulp-tasks')(gulp, $, paths);

var isWatching = false;

// Extensive watch on the source and unit test files
var watchTasks = ['ts:compile:source', 'test:spec', 'scss:copy'];
gulp.task('watch', watchTasks, function () {
  isWatching = true;
  gulp.watch([paths.source.from], ['ts:compile:source', 'test:spec'])
  gulp.watch([paths.test.from], ['test:spec'])
  gulp.watch([paths.style.from], ['scss:copy'])
  gulp.watch([paths.e2e.from, paths.e2e.templates], ['ts:compile:e2e', 'compile:e2e', 'compile:demo'])
});

// Serves files via `gulp serve`
gulp.task('serve', function(callback){
  isWatching = true;
  return runSequence(
    ['ts:compile:source', 'scss:copy', 'compile:e2e'],
    ['server'],
    callback);
});

gulp.task('demo', function(callback){
  isWatching = true;
  return runSequence(
    ['ts:compile:source', 'scss:copy', 'compile:e2e', 'compile:demo'],
    ['server'],
    callback);
});

// Builds the library and runs unit tests
gulp.task('build', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['ts:compile:source', 'scss:copy'],
    ['test:spec'],
  callback);
});

// Builds the library, runs unit and integration tests
// and reports the coverage to Coveralls
gulp.task('travis', function(callback) {
  return runSequence(
    ['clean:source', 'clean:test'],
    ['ts:compile:source', 'scss:copy'],
    ['test:spec'],
    ['test:e2e'],
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
