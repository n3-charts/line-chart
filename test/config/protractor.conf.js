exports.config = {

  // Directly connect to the selenium server
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // The URL used in the tests
  baseUrl: 'http://localhost:1234/',

  // Spec patterns are relative to the configuration file location passed to protractor
  // They may include glob patterns.
  specs: ['../../.tmp/**/*.e2e.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true, // Use colors in the command line report.
  }
};

if(process.env.TRAVIS){
  exports.config.capabilities.chromeOptions = {
    args: ['--no-sandbox', '--test-type=browser']
  }
}
