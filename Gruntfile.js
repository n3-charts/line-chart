/*global module:false, require:false*/
module.exports = function(grunt) {
  'use strict';

  // Load Deps
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Travis doesn't have chrome, so we need to overwrite some options
  var testConfig = function(configFile, customOptions) {
    var options = { configFile: configFile, keepalive: true };
    var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
    return grunt.util._.extend(options, customOptions, travisOptions);
  };

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '###\n<%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("dd mmmm yyyy") %>\n' +
      '<%= pkg.homepage ? pkg.homepage + "\\n" : "" %>' +
      'Copyright (c) <%= grunt.template.today("yyyy") %> n3-charts' +
      '\n###\n',

    bannerjs: '/*\n<%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("dd mmmm yyyy") %>\n' +
      '<%= pkg.homepage ? pkg.homepage + "\\n" : "" %>' +
      'Copyright (c) <%= grunt.template.today("yyyy") %> n3-charts' +
      '\n*/\n',

    watch: {
      files: ['lib/**/*.coffee', 'test/*.mocha.coffee'],
      tasks: ['default']
    },

    karma: {
      options: testConfig('karma.conf.js'),

      continuous: {
        singleRun: true,
        autoWatch: false,
        browsers: ['Firefox']
      }
    },

    concat: {
      utils: {
        src: ['lib/utils/*.coffee'],
        dest: '/tmp/utils.coffee',
        options: {
          banner: grunt.file.read('lib/utils/utils.coffee.prefix'),
          footer: grunt.file.read('lib/utils/utils.coffee.suffix'),
          separator: '\n\n',
          process: function(src, filepath) {
            return '# ' + filepath + '\n' + src + '\n# ----\n';
          }
        }
      },
      js: {
        options: {
          banner: '<%= banner %>',
          stripBanners: true,
          process: function(src, filepath) {
            return '# ' + filepath + '\n' + src + '\n# ----\n';
          }
        },
        src: ['lib/<%= pkg.name %>.coffee', '/tmp/utils.coffee'],
        dest: 'dist/<%= pkg.name %>.coffee'
      }
    },

    coffeelint: {
      app: ['dist/<%= pkg.name %>.coffee'],
      options: {
        'max_line_length': {
          'level': 'ignore'
        }
      }
    },

    coffee: {
      options: {
        bare: true
      },
      compile: {
        files: {
          'dist/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.coffee'
        }
      }
    },

    uglify: {
      options: {
        banner: '<%= bannerjs %>'
      },
      js: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      test: {
        src: ['lib/*.js']
      }
    }
  });

  // Default task.
  grunt.registerTask('travis', 'default');
  grunt.registerTask('default', ['concat', 'coffeelint', 'coffee', 'uglify', 'karma:continuous', ]);
  grunt.registerTask('coverage', ['concat', 'karma:unit']);
};
