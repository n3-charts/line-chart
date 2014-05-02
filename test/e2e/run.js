var page = require('webpage').create();
page.open('simple/page.html', function () {
  page.render('simple/computed.png');
  phantom.exit();
});
