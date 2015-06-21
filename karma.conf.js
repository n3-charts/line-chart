module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon'],
    exclude: [],
    files: [
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/d3/d3.js',
        'build/line-chart.js',
        'test/unit/**/*.coffee'
    ],
    preprocessors: {
        'test/unit/**/*.coffee': 'coffee'
    },
    singleRun: false,
    autoWatch: true,
    browsers: ['Firefox'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    captureTimeout: 60000,
  });
};
