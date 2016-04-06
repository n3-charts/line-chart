var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;

module.exports = function(gulp, $, paths) {

  gulp.task('new-e2e-hjson', function(done) {
    if (!argv.name) {
      throw new Error('Please give a name to this new test (usage : gulp new-e2e-test --name=my_awesome_test)');
    }

    fs.stat(path.join('e2e/templates/', argv.name, '.hjson'), function(err, stat) {
      if (err == null) {
        throw new Error(argv.name + ' already exists !');
      } else if (err.code == 'ENOENT') {
        gulp.src('e2e/templates/*.hjson.tpl')
          .pipe($.template({name: argv.name}))
          .pipe($.rename(function(file) {
            file.basename = file.basename.replace('new_test', argv.name);
            file.extname = '';
          }))
          .pipe(gulp.dest('e2e/test_cases/'))
          .on('end', done);
      } else {
        throw err;
      }
    });
  });

  gulp.task('new-e2e-ts', function(done) {
    if (!argv.name) {
      throw new Error('Please give a name to this new test (usage : gulp new-e2e-test --name=my_awesome_test)');
    }

    fs.stat(path.join('e2e/templates/', argv.name, '.ts'), function(err, stat) {
      if (err == null) {
        throw new Error(argv.name + ' already exists !');
      } else if (err.code == 'ENOENT') {
        gulp.src('e2e/templates/*.ts.tpl')
          .pipe($.template({name: argv.name}))
          .pipe($.rename(function(file) {
            file.basename = file.basename.replace('new_test', argv.name);
            file.extname = '';
          }))
          .pipe(gulp.dest('e2e/tests/'))
          .on('end', done);
      } else {
        throw err;
      }
    });
  });

  gulp.task('new-e2e-test', ['new-e2e-hjson', 'new-e2e-ts']);
};
