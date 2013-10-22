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
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> n3-charts ' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

    watch: {
      files: ['lib/**/*.js', 'test/*.spec.js'],
      tasks: ['jshint', 'concat', 'uglify', 'karma:continuous']
    },

    karma: {
      options: testConfig('karma.conf.js'),

      continuous: {
        singleRun: true,
        autoWatch: false,
        browsers: ['PhantomJS']
      },

      unit: {
        singleRun: true,
        autoWatch: false,
        coverageReporter: {
          type : 'html',
          dir : 'coverage/'
        },
        browsers: ['PhantomJS']
      }
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      utils: {
        src: ['lib/utils/*.js'],
        dest: '/tmp/utils.js',
        options: {
          banner: grunt.file.read('lib/utils/utils.js.prefix'),
          footer: grunt.file.read('lib/utils/utils.js.suffix'),
          separator: ',\n\n'
        }
      },
      js: {
        src: ['lib/<%= pkg.name %>.js', '/tmp/utils.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      test: {
        src: ['test/spec.prefix', 'test/*.spec.js' ,'test/spec.suffix'],
        dest: '/tmp/<%= pkg.name %>.spec.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      js: {
        src: '<%= concat.js.dest %>',
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
  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'karma:continuous']);

  grunt.registerTask('fast-build', ['concat', 'uglify']);
  grunt.registerTask('coverage', ['concat', 'karma:unit']);
};
