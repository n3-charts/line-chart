var protractor = require('gulp-protractor').protractor;
var webdriver = require('gulp-protractor').webdriver;
var webdriverUpdate = require('gulp-protractor').webdriver_update;

var argv = require('yargs').argv;

var fs = require('fs');
var path = require('path');

var hjson = require('hjson');

module.exports = function(gulp, $, paths) {
  // Shamelessly stolen from http://stackoverflow.com/a/30985576
  gulp.task('compile:e2e', function() {

    return gulp.src(paths.e2e.templates)
      .pipe($.foreach(function(stream, file){
          var hjsonFile = file;
          var hjsonBasename = path.basename(hjsonFile.path, path.extname(hjsonFile.path));

          return gulp.src(paths.e2e.base)
            .pipe($.rename(function(htmlFile) {
              htmlFile.basename = hjsonBasename;
            }))
            .pipe($.data(function() {
              return hjson.parse(fs.readFileSync(hjsonFile.path, 'utf8'));
            }))
            .pipe($.template({name: hjsonBasename}))
            .pipe(gulp.dest(paths.test.to + '/e2e/'))
        })
      )
  });

  // Serve the static files
  gulp.task('server', $.serve({
      root: ['.tmp', 'node_modules'],
      port: 1234
    })
  );

  // Update webdriver and selenium
  gulp.task('webdriver', webdriver);
  gulp.task('webdriver:update', webdriverUpdate);


  // Run the integration tests with protractor

  // Alternatively run `gulp test:e2e --test=<%test-name%>` where test-nam can be pan_zoom for instance
  // so : gulp test:e2e --test=pan_zoom

  gulp.task('test:e2e', [
    'webdriver:update', 'webdriver', 'ts:lint:e2e', 'ts:compile:e2e', 'compile:e2e', 'scss:copy', 'server'
  ], function() {
    return gulp.src(argv.test ? 'test/**/' + argv.test + '.e2e.ts' : paths.e2e.from)
      .pipe(protractor({
        configFile: paths.e2e.config,
        keepAlive: false,
      }))
      .on('error', function(err) { throw err; });
  });
};
