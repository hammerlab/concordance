var assert = require("assert"),
    jsdom = require("jsdom").jsdom,
    _ = require("underscore");

// TODO(danvk): figure out if it's possible to use Node's require() here.
// TODO(danvk): wrap this up in a test helper module.
var document = jsdom('<html><head>' + 
    '<script src="../node_modules/d3/d3.min.js"></script>' + 
    '<script src="../node_modules/underscore/underscore-min.js"></script>' + 
    '<script src="../d3.stacked-bar-chart.js"></script>' + 
    '</head><body></body></html>');

var window = document.parentWindow;
var $ = require("jquery")(window);

describe('d3.stacked-bar-chart', function() {
  it('should have the right defaults', function() {
    var chart = window.d3.chart.stackedBars();
    assert.equal(960, chart.width());
    assert.equal(500, chart.height());
  });

  it('should be minimally functional', function() {
    var data = [
        [{"name":"3","value":1325},{"name":"2","value":98},{"name":"1","value":104}],
        [{"name":"3","value":1325},{"name":"2","value":260},{"name":"1","value":68}],
        [{"name":"3","value":1325},{"name":"2","value":200},{"name":"1","value":155}]
    ];
    data[0].name = 'truth.chr20';
    data[1].name = 'mutect.chr20';
    data[2].name = 'somaticsniper.chr20';

    var sum = function(list) { return list.reduce(function(a,b){return a + b;}, 0); };
    var chart = window.d3.chart.stackedBars()
        .title("Caller Concordance")
        .yAxisTitle("Number of Variants Called")
        .sectionBinDesc("callers in concordance")
        .stackColors(['#410078', '#FBA6FC'])
        .sectionComparator(function(a,b) {
           return parseInt(b.name) > parseInt(a.name);
        })
        .barComparator(function(a, b) {
            var totalA = sum(a.map(function(s){ return s.value; }));
            var totalB = sum(b.map(function(s){ return s.value; }));
            return totalA - totalB;
        });

    var div = document.createElement('div');
    div.setAttribute('id', 'conc_div');
    document.body.appendChild(div);
    window.d3.select('#conc_div').datum(data).call(chart);

    var sumTexts = $.makeArray($('g.bar text', div)).map(function(x) { return $(x).text()});
    assert.deepEqual(["1,527", "1,653", "1,680"], sumTexts);

    // TODO: add more thorough assertions here.
  });

  // TODO: add tests of more complex behavior.
});
