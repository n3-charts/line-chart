exports.config = {

  // Directly connect to the selenium server
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // The URL used in the tests
  baseUrl: 'http://localhost:1234/',

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.
  },

  onPrepare: function() {
    browser.ignoreSynchronization = true;
  }
};

if (process.env.TRAVIS){
  exports.config.capabilities.chromeOptions = {
    args: ['--no-sandbox', '--test-type=browser']
  }
}
