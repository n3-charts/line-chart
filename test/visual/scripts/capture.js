var system = require('system');
var args = system.args;

var page = require('webpage').create();

page.open(args[1], function () {
  page.evaluate(%phantomjs%);

  page.render(args[2]);
  phantom.exit();
});
