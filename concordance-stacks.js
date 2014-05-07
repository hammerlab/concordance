  /////////////////////
 //   Utility Fns   //
/////////////////////

var humanizeInteger = d3.scale.ordinal()
    .domain(d3.range(0, 11))
    .range(["zero", "one", "two", "three",
            "four", "five", "six", "seven",
            "eight", "nine", "ten"]);


  //////////////////////
 //   Data Munging   //
//////////////////////
// Convert the output of concordance_counter.py into a 2D array for the stacked bar chart.

function zeros(n) {
    var a = [];
    for (var i = 0; i < n; i++) {
        a.push(0);
    }
    return a;
}

// caller -> # of others -> count
var callerConcordanceCounts = {};
callers.forEach(function(caller) {
    callerConcordanceCounts[caller] = zeros(1 + callers.length);
});
var unionCounts = zeros(1 + callers.length);

for (var callerSetStr in data) {
    var count = data[callerSetStr];
    var callerSet = callerSetStr.split(',');
    var numAgreeingCallers = callerSet.length;
    callerSet.forEach(function(caller) {
        callerConcordanceCounts[caller][numAgreeingCallers] += count;
    });
    unionCounts[numAgreeingCallers] += count;
}

data = [];
callers.sort().forEach(function(caller) {
    var row = [].concat(callerConcordanceCounts[caller]);
    row[0] = caller;
    data.push(row);
});
unionCounts[0] = "Union";
data.push(unionCounts);



  ///////////////
 // Visualize //
///////////////

var margin = {top: 20, right: 250, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .5);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

// Gradient from dark purple to light pink, inspired by "Beyond Venn Diagrams".
var colorScale = d3.scale.linear()
    .domain([0, callers.length - 1])
    .range(['#410078', '#FBA6FC']);

var color = d3.scale.ordinal()
    .domain(d3.range(1, callers.length + 1).reverse())
    .range(d3.range(0, callers.length).map(colorScale));

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


data.forEach(function(d) {
    var y0 = 0;
    d.counts = color.domain().map(function(conc) {
        return {name: conc, y0: y0, y1: y0 += +d[conc]};
    });
    d.total = d.counts[d.counts.length - 1].y1;
});

// Create some additional space between "Union" and the individual callers by
// adding an empty x category.
var augmentedLabels = data.map(function(d) { return d[0]; });
augmentedLabels.splice(augmentedLabels.length - 1, 0, "");
x.domain(augmentedLabels);
y.domain([0, d3.max(data, function(d) { return d.total; })]);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

var yAxisGroup = svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);
yAxisGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("x", -height + 113)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Number of Variant Calls");

var bars = svg.selectAll(".bars")
    .data(data)
    .enter().append("g")
    .attr("class", "g")
    .attr("transform", function(d) { return "translate(" + x(d[0]) + ",0)"; });

bars.selectAll("rect")
    .data(function(d) { return d.counts; })
    .enter().append("rect")
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.y1); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
    .style("fill", function(d) { return color(d.name); });

// data labels
bars.selectAll("text")
    .data(function(d) { return [d]; })
    .enter().append("text")
    .attr('y', function(d) { return y(d.total); })
    .attr('dy', '-0.35em')
    .attr('dx', x.rangeBand() / 2)
    .attr('style', 'text-anchor: middle')
    .text(function(d) { return d3.format("n")(d.total); });

var legend = yAxisGroup.selectAll(".legend")
    .data(color.domain().slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

legend.append("rect")
    .attr("x", width + margin.left)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

legend.append("text")
    .attr("x", width + margin.left + 18 + 6)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .style("fill", color)
    .text(function(d) {
        var callerStr = "";
        if (d === 1) {
            callerStr = "a single caller";
        } else if (d === callers.length) {
            callerStr = "all callers";
        } else if (d < 10) {
            callerStr = humanizeInteger(d) + " callers";
        } else {
            callerStr = d + " callers";
        }
        return "Detected by " + callerStr;
    });
