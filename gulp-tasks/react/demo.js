var protractor = require('gulp-protractor').protractor;
var webdriver = require('gulp-protractor').webdriver;
var webdriverUpdate = require('gulp-protractor').webdriver_update;
var runSequence = require('run-sequence');

var fs = require('fs');
var path = require('path');

var hjson = require('hjson');
var glob = require('glob');

module.exports = function(gulp, $, paths) {

  gulp.task('demoAll:compile:react', function(done) {
    glob(paths.e2e.templates, function (er, files) {
      gulp.src(paths.e2e.react.all)
        .pipe($.data(function() {
          return {examples: files.map(function(file) {
            var d = hjson.parse(fs.readFileSync(file, 'utf8'));
            d.name = path.basename(file, '.hjson');
            return {data: d};
          })};
        }))
        .pipe($.template())
        .pipe($.rename(function(file) {
          file.basename = 'index';
        }))
        .pipe(gulp.dest(paths.test.to + '/e2e/'))
        .on('end', done);
    });
  });


};
