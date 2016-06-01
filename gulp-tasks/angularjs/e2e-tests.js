var protractor = require('gulp-protractor').protractor;
var webdriver = require('gulp-protractor').webdriver;
var webdriverUpdate = require('gulp-protractor').webdriver_update;

var argv = require('yargs').argv;

var fs = require('fs');
var path = require('path');

var hjson = require('hjson');

module.exports = function(gulp, $, paths) {
  // Shamelessly stolen from http://stackoverflow.com/a/30985576
  gulp.task('demoSingle:compile:angularjs', function() {

    return gulp.src(paths.e2e.templates)
      .pipe($.foreach(function(stream, file){
          var hjsonFile = file;
          var hjsonBasename = path.basename(hjsonFile.path, path.extname(hjsonFile.path));

          return gulp.src(paths.e2e.angularjs.single)
            .pipe($.rename(function(htmlFile) {
              htmlFile.basename = hjsonBasename;
            }))
            .pipe($.data(function() {
              return {data: hjson.parse(fs.readFileSync(hjsonFile.path, 'utf8'))};
            }))
            .pipe($.template({name: hjsonBasename}))
            .pipe(gulp.dest(paths.test.to + '/e2e/'))
        })
      )
  });

  // Run the integration tests with protractor
  // Also compiles the demo because some tests load the demo page
  // instead of a specific test page
  // Alternatively run `gulp e2e:test:angularjs --test=<%test-name%>` where test-name can be pan_zoom for instance
  // so : gulp e2e:test:angularjs --test=pan_zoom
  gulp.task('e2e:test:angularjs', [
    'webdriver:update', 'webdriver', 'ts:lint:e2e', 'demoSingle:compile:angularjs', 'demoAll:compile:angularjs', 'e2e:compile', 'scss:copy', 'server'
  ], function() {
    return gulp.src(argv.test ? paths.test.to + '/**/' + argv.test + '.e2e.js' : paths.test.to + '/**/*.e2e.js')
    .pipe(protractor({
      configFile: paths.e2e.config,
      keepAlive: false,
    }))
    .on('error', function(err) { throw err; });
  });
};
