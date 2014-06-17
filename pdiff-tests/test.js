var pdifftest = require('./lib/pdifftest');

casper.test.begin('Concordance example', 1, function(test) {
  pdifftest.startTest(casper, 'viewer/concordance.html', function() {
    var screenshot = pdifftest.takeScreenshot(casper);
    pdifftest.checkAgainstGolden(casper, screenshot, 'pdiff-tests/golden/concordance.png');
  });

  casper.run(function() {
    test.done();
  });
});
