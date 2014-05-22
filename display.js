_.sum = function(list) { return list.reduce(function(a,b){return a + b;}, 0); };

// Raw data is in the form `{bar1: {stack1: val, stack2: val, ..}, .. }`, need
// to transform into array of bars (arrays) of sections (objects with value &
// name).
var mutect_fa = _.map(dpfaBinning["mutect"], function(sectionMap, barName) {
    var sections = _.map(_.keys(sectionMap), function(name) {
        return {name: name, value: sectionMap[name]};
    });
    sections.name = barName;
    return sections;
});

var somatic_sniper_fa = _.map(dpfaBinning["somaticsniper"], function(sectionMap, barName) {
    var sections = _.map(_.keys(sectionMap), function(name) {
        return {name: name, value: sectionMap[name]};
    });
    sections.name = barName;
    return sections;
});

var conc_data = _.map(concordanceCounts, function(sectionMap, barName) {
    var sections = _.map(_.keys(sectionMap), function(name) {
        return {name: name, value: sectionMap[name]};
    });
    sections.name = barName;
    return sections;
});

function reverseStringTupleComparator(a,b) {
    a = a.replace(/\(|\)|\s/g, "").split(",").map(function(v){return parseFloat(v);});
    b = b.replace(/\(|\)|\s/g, "").split(",").map(function(v){return parseFloat(v);});
    if (a.length !== b.length)  throw TypeError("Tuples must be of the same length.");
    for (var i in a) {
        if (a[i] === b[i]) {
            continue;
        } else if (a[i] > b[i]) { // a > b
            return 1;
        } else { // b > a
            return -1;
        }
    }
    return 0; // a == b
}

var fa_chart = d3.chart.stackedBars()
    .xAxisTitle("Read Depth Range")
    .yAxisTitle("Number of Variants Called")
    .sectionBinDesc("frequency of allele")
    .showBarTotals(false)
    .width(200)
    .height(150)
    .barComparator(function(a,b) {
        return reverseStringTupleComparator(a.name, b.name);
    })
    .sectionComparator(function(a,b) {
        return reverseStringTupleComparator(a.name, b.name);
    });


var conc_chart = d3.chart.stackedBars()
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


d3.select("#fa1")
  .datum(somatic_sniper_fa)
  .call(fa_chart.title("Somatic Sniper"));

d3.select("#fa2")
  .datum(mutect_fa)
  .call(fa_chart.title("MuTect"));

d3.select("#conc").style("margin-top", "47px")
  .datum(conc_data)
  .call(conc_chart);


displayScores(scores);
