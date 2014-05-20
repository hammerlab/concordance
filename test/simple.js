var assert = require("assert"),
    jsdom = require("jsdom").jsdom;

// TODO(danvk): figure out if it's possible to use Node's require() here.
// TODO(danvk): wrap this up in a test helper module.
var document = jsdom('<html><head>' + 
    '<script src="../node_modules/d3/d3.min.js"></script>' + 
    '<script src="../node_modules/underscore/underscore-min.js"></script>' + 
    '<script src="../d3.stacked-bar-chart.js"></script>' + 
    '</head><body></body></html>');

var window = document.parentWindow;

describe('d3.stacked-bar-chart', function() {
  it('should have the right defaults', function() {
    var chart = window.d3.chart.stackedBars();
    assert.equal(960, chart.width());
    assert.equal(500, chart.height());
  });

  it('should be minimally functional', function() {
    var data = [
        [{"name":"3","value":1325,"y0":0,"y1":1325},{"name":"2","value":98,"y0":1325,"y1":1423},{"name":"1","value":104,"y0":1423,"y1":1527}],
        [{"name":"3","value":1325,"y0":0,"y1":1325},{"name":"2","value":260,"y0":1325,"y1":1585},{"name":"1","value":68,"y0":1585,"y1":1653}],
        [{"name":"3","value":1325,"y0":0,"y1":1325},{"name":"2","value":200,"y0":1325,"y1":1525},{"name":"1","value":155,"y0":1525,"y1":1680}]
    ];
    data[0].name = 'truth.chr20';
    data[1].name = 'mutect.chr20';
    data[2].name = 'somaticsniper.chr20';

    var chart = window.d3.chart.stackedBars()
        .title("Caller Concordance")
        .yAxisTitle("Number of Variants Called")
        .sectionBinDesc("callers in concordance")
        .stackColors(['#410078', '#FBA6FC'])
        .sectionComparator(function(a,b) {
           return parseInt(b.name) > parseInt(a.name);
        })
        .barComparator(function(a, b) {
            var totalA = _.sum(a.map(function(s){ return s.value; }));
            var totalB = _.sum(b.map(function(s){ return s.value; }));
            return totalA - totalB;
        });

    var div = document.createElement('div');
    div.setAttribute('id', 'conc_div');
    window.d3.select('#conc_div').datum(data).call(chart);
  });
});
