(function(){

function sum(arr) {
    return arr.reduce(function(a, v){ return a + v; }, 0);
}

function uniq(list) {
    return list.reduce(function(a,v){
        if (a.indexOf(v) != -1) {
            return a;
        } else {
            a.push(v);
            return a;
        }
    }, []);
}

function d3_stackedBars() {
    // Need to ensure that data is properly formatted: all bins must be present in
    // order to have proper ordering. Data is in the form:
    // BARS := SECTION*
    // SECTION := {...}
    // where sections have numeric values which can be stacked. Bars and sections
    // should also be identifiable (default, have a `name` attribute, but this can
    // be specified with barName and sectionName).
    //

    var margin = {top: 40, right: 200, bottom: 50, left: 40},
        width  = 960,
        height = 500,
        barName = function(d)  { return d.name; }, // Get the x value of the bar.
        sectionValue  = function(d) { return d.value; }, // Get the value of a section.
        sectionName = function(d) { return d.name; },    // Get the name of a section.
        xScale = d3.scale.ordinal(),
        yScale = d3.scale.linear(),
        xAxis  = d3.svg.axis().scale(xScale)
                       .orient("bottom"),
        yAxis  = d3.svg.axis().scale(yScale)
                       .orient("left")
                       .tickFormat(d3.format(".2s")),
        colorScale  = d3.scale.linear(),
        color       = d3.scale.ordinal(),
        yAxisTitle  = "",
        xAxisTitle  = "",
        title       = "",
        legendText  = "",
        showBarTotals = true,
        stackColors = ['orange', 'darkred'],
        barSorter   = null,
        stackSorter = null;


    function chart(selection) {
        selection.each(function(data) {
            var data = data.sort(barSorter).map(function(s) {
                    return s.sort(stackSorter);
                }),
                // Calculate how the bars should be stacked:
                data = data.map(function(d){
                    var start = 0;
                    var bar = d.map(function(s) {
                        s.y0 = start;
                        s.y1 = start += sectionValue(s);
                        return s;
                    });
                    bar.total = sum(bar.map(function(s) { return sectionValue(s); }));
                    bar.name = d.name;
                    return bar;
                }),
                barNames = data.map(function(d) {
                    return barName(d);
                }),
                sectionNames = uniq(data.reduce(function(a,v){
                    return a.concat(v.map(sectionName));
                }, [])),
                maxBarTotal = d3.max(data, function(d) {
                    return sum(d.map(function(i) {
                        return sectionValue(i);
                    }));
                });

            xScale
                .domain(barNames)
                .rangeRoundBands([0, width], .5);

            yScale
                .domain([0, maxBarTotal])
                .rangeRound([height, 0]);

            colorScale
                .domain([0, sectionNames.length - 1])
                .range(stackColors);

            color
                .domain(sectionNames)
                .range(d3.range(0, sectionNames.length).map(colorScale));

            var svg = d3.select(this).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                      .append("g")
                        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

            var bars = svg.selectAll(".bar")
                          .data(data)
                        .enter().append("g")
                          .attr("class", "bar")
                          .attr("transform", function(d) { return "translate(" + xScale(barName(d)) + ", 0)"; });

            var sections = bars.selectAll(".bar")
                               .data(function(d){return d;})
                             .enter().append("rect")
                               .attr("width", xScale.rangeBand())
                               .attr("y", function(d) { return yScale(d.y1); })
                               .attr("height", function(d) { return yScale(d.y0) - yScale(d.y1); })
                               .style("fill", function(d) { return color(d.name); });

            var xAxisGroup = svg.append("g")
                                .attr("class", "x axis")
                                .attr("transform", "translate(0, " + height + ")")
                                .call(xAxis);

            xAxisGroup.append("text")
                      .attr("y", 33)
                      .attr("x", width/2)
                      .attr("dy", ".71em")
                      .style("text-anchor", "middle")
                      .text(xAxisTitle);

            var yAxisGroup = svg.append("g")
                                .attr("class", "y axis")
                                .call(yAxis);

            yAxisGroup.append("text")
                      .attr("transform", "rotate(-90)")
                      .attr("y", 6)
                      .attr("x", -height/2)
                      .attr("dy", ".71em")
                      .style("text-anchor", "middle")
                      .text(yAxisTitle);

            if (showBarTotals) {
                bars.selectAll("text")
                    .data(function(d) { return [d]; })
                    .enter().append("text")
                    .attr('y', function(d) { return yScale(d.total); })
                    .attr('dy', '-0.35em')
                    .attr('dx', xScale.rangeBand() / 2)
                    .text(function(d) { return d3.format("n")(d.total); });
            }

            // Chart title
            svg.append("g")
                .attr("transform", "translate(" + width/2 + ", " + -margin.top/2 + ")")
              .append("text")
                .attr("id", "title")
                .text(title);

            // Legend
            var legend = yAxisGroup.selectAll(".legend")
                                   .data(color.domain().slice().reverse())
                                 .enter().append("g")
                                   .attr("class", "legend")
                                   .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

            legend.append("rect")
                  .attr("x", width + margin.left - 66)
                  .attr("width", 18)
                  .attr("height", 18)
                  .style("fill", color);

            legend.append("text")
                  .attr("x", width + margin.left + 6 + 18 - 66)
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .style("fill", color)
                  .text(function(d) {
                      return d + " " + legendText + ".";
                  });
        });
    }


    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        margin = _;
        return width;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.stackColors = function(_) {
        if (!arguments.length) return stackColors;
        stackColors = _;
        return chart;
    };

    chart.title = function(_) {
        if (!arguments.length) return title;
        title = _;
        return chart;
    };

    chart.sectionBinDesc = function(_) {
        if (!arguments.length) return legendText;
        legendText = _;
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

    chart.sectionValue = function(_) {
        if (!arguments.length) return sectionValue;
        sectionValue = _;
        return chart;
    };

    chart.barComparator = function(_) {
        if (!arguments.length) return barSorter;
        barSorter = _;
        return chart;
    };

    chart.sectionComparator = function(_) {
        if (!arguments.length) return stackSorter;
        stackSorter = _;
        return chart;
    };

    chart.showBarTotals = function(_) {
        if (!arguments.length) return showBarTotals;
        showBarTotals = _;
        return chart;
    };

    chart.sectionName = function(_) {
        if (!arguments.length) return sectionName;
        sectionName = _;
        return chart;
    }

    chart.barName = function(_) {
        if (!arguments.length) return barName;
        barName = _;
        return chart;
    }

    return chart;
}

if (d3.chart === undefined)  d3.chart = {};
d3.chart.stackedBars = d3_stackedBars;

})();
