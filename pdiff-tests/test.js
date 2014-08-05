var pdifftest = require('./lib/pdifftest');

// 1 = number of tests in this suite.
casper.test.begin('Concordance example', 1, function(test) {
  // This sequence just configures the test, it doesn't run it.
  pdifftest.startTest(casper, 'viewer/concordance.html', function() {
    // ... click things ...

    var screenshot = pdifftest.takeScreenshot(casper);
    pdifftest.checkAgainstGolden(casper, screenshot, 'pdiff-tests/golden/concordance.png');
  });

  // Until you call "test.done()", the test will hang!
  casper.run(function() {
    test.done();
  });
});
