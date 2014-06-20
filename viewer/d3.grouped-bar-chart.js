(function(){

function d3_groupedBars() {
  var margin = {top: 30, right: 80, bottom: 30, left: 40},
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  function chart(selection) {
    selection.each(function(data) {

    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.groupColors = function(_) {
    if (!arguments.length) return stackColors;
    stackColors = _;
    return chart;
  };

  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
  };

  chart.xAxisTitle = function(_) {
    if (!arguments.length) return xAxisTitle;
    xAxisTitle = _;
    return chart;
  };

  chart.yAxisTitle = function(_) {
    if (!arguments.length) return yAxisTitle;
    yAxisTitle = _;
    return chart;
  };

}

if (d3.chart === undefined)  d3.chart = {};
d3.chart.groupedBars = d3_groupedBars;

})();

function displayScores(el, scores) {
  var data = [];
  var scoreNames = ['f1score', 'recall', 'precision'];
  // Data will be a list of objects like {name: variant_caller_name, value:
  // the_score, type: the_score_type}
  for (var name in scores) {
    var score = scores[name];
    for (var type in scoreNames) {
      var scoreName = scoreNames[type];
      data.push({name: name, value: score[scoreName], type: scoreName});
    }
  }

  var margin = {top: 30, right: 80, bottom: 30, left: 40},
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var x0 = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
      .domain([0.75, 1])
      .range([height, 0]);

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var xAxis = d3.svg.axis()
      .scale(x0)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var svg = d3.select(el).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var callerNames = _.uniq(data.map(function(d) { return d.name; }));

  x0.domain(scoreNames);
  x1.domain(callerNames).rangeRoundBands([0, x0.rangeBand()], 0, 2);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Score");

  var parts = svg.selectAll(".part")
      .data(data)
    .enter().append("g")
      .attr("class", "part")
      .attr("transform", function(d) { return "translate(" + (x1(d.name) + x0(d.type)) + ",0)"; });

  var bars = parts.selectAll(".bar")
      .data(function(d) { return [d]; })
    .enter().append("rect")
      .attr('width', x1.rangeBand())
      .attr('y', function(d) { return y(d.value); })
      .attr('height', function(d) { return height - y(d.value); })
      .style('fill', function(d) { return color(d.name); });

  parts.selectAll("text")
    .data(function(d) { return [d]; })
    .enter().append("text")
      .attr('class', 'score-text')
      .attr('transform', 'rotate(90)')
      .attr('x', function(d) { return y(d.value) + 10; })
      .attr('dy', '-0.79em')
      .text(function(d) { return d3.format(".3f")(d.value); });

  var legend = svg.selectAll(".legend")
      .data(callerNames.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width + 60)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width + 55)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });
}
