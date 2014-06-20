// TODO
// 0. label stacks within groups (if requested)
// 1. legend positiong (and consequent chart resizing)
//    c.f. HACK margin.right and svgWidth default.
// 2. allow filtering bars, stacks
// 3. allow passing in a color function (not just range)
// 4. sorting stacks
// 5. allow smart axes (e.g. show ticks n bars apart, etc)

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

function getter(name) {
  return function(d) {
    return d[name];
  }
}

function hash(obj) {
  var str = JSON.stringify(obj),
      hash = 0;
  if (str.length == 0) return hash;
  for (i = 0; i < str.length; i++) {
    var char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function d3_bars() {

  var margin = {top: 60, right: 175, bottom: 40, left: 40},
      svgWidth = 675,
      svgHeight = 500,
      groupScale = d3.scale.ordinal(),
      intraGroupScale = d3.scale.ordinal(),
      barHeightScale = d3.scale.linear(),
      intraBarScale = d3.scale.ordinal(),
      xAxis = d3.svg.axis().scale(groupScale).orient("bottom"),
      yAxis = d3.svg.axis().scale(barHeightScale).orient("left"),
      barValue = function(d, i) { return d; },
      _idxGetter = getter('__index__'),
      groupBy = _idxGetter,
      stackBy = _idxGetter,
      colorBy = function() { return true; }, // No coloring by default.
      interStackSorter = null,
      intraStackSorter = function() { return 1; },
      colors = ['#ffffff', '#000000'],
      barLabel = function(d, i) { return ""; },
      stackLabel = function(d, i) { return ""; },
      yAxisTitle = "",
      xAxisTitle = "",
      title = "",
      interGroupPadding = 0,
      intraGroupPadding = 0, // why must it be this to not have spaces? (oh,
                             // rangeRoundBAND <- to make it snap to nearest
                             // pixel....hmm
      yTickFormatter = function(d) { return d; },
      xTickFormatter = function(d) { return d; },
      legendLabeler = function(d, i) { return d; },
      color = d3.scale.ordinal(),
      colorScale = d3.scale.linear();


  function chart(selection) {
    chartWidth = svgWidth - margin.right - margin.left;
    chartHeight = svgHeight - margin.top - margin.bottom;

    selection.each(function(data) {

      // TODO(ihodes): HACK! This is not ideal. If nest().key(fn) passed indices
      //               to fn, then we wouldn't need to do this. HACK!
      if (typeof data[0] === 'object') {
        data = data.map(function(d,i) { d.__index__ = i; return d; });
      }


        ////////////////
       // Initialize //
      ////////////////

      var maxBarValue = d3.max(data, function(d, i) {
            return barValue(d, i);
          }),
          nestedData = d3.nest().key(groupBy).key(stackBy).entries(data),
          maxStackValue = d3.max(nestedData, function(group) {
            return d3.max(group.values, function(stack) {
              return d3.sum(stack.values.map(barValue));
            });
          }),
          minStackValue = 0,
          maxGroupSize = d3.max(nestedData, function(group) {
            return group.values.length;
          }),
          maxStackSize = d3.max(nestedData, function(group) {
            return d3.max(group.values, function(stack) {
              return stack.values.length;
            });
          }),
          svg = d3.select(this).append("svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight)
            .append("g")
              .attr("class", "chart")
              .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


      // TODO(ihodes): rangeRoundBands might be preferable here, but with it we
      //               get odd spacing issues between groups when we don't want
      //               spaces between them.
      groupScale
          .domain(data.map(groupBy))
          .rangeBands([0, chartWidth], interGroupPadding);

      intraGroupScale
          .domain(d3.range(0, maxGroupSize))
          .rangeBands([0, groupScale.rangeBand()], intraGroupPadding);


      barHeightScale
          .domain([minStackValue, maxStackValue])
          .rangeRound([chartHeight, 0]);

      intraBarScale
          .domain(d3.range(0, maxStackSize))
          .rangeRoundBands([0, chartHeight]);


      var colorDomain = uniq(data.map(colorBy));
      colorScale
          .domain([0, colorDomain.length - 1])
          .range(colors);

      color
          .domain(colorDomain)
          .range(d3.range(0, colorDomain.length).map(colorScale));


        //////////
       // Bars //
      //////////

      var groups = svg.selectAll(".group")
          .data(nestedData)
        .enter().append("g")
          .attr("class", "group")
          .attr("transform", function(d, i) {
            // This transformation is to detmerine how groups are placed along
            // the x axis.
            return "translate(" + groupScale(d.key) + ", 0)";
          });

      var stacks = groups.selectAll(".stack")
          .data(function(d) { return d.values.sort(function(a,b){ return intraStackSorter(a.key, b.key); }) })
        .enter().append("g")
          .attr("class", "stack")
          .attr("transform", function(d, i) {
            // This transformation is to determing how stacks of bars within the
            // same group are placed relative to each other.
            return "translate(" + intraGroupScale(i) + ", 0)";
          });

      var bars = stacks.selectAll(".bar")
          .data(function(d) { return d.values.sort(interStackSorter); })
        .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d, i) {
            // This tranformation is to determine how bars stack on top of one
            // another.
            var barHeight = barHeightScale(barValue(d)),
                siblings = this.parentNode.childNodes,
                cumulativeSiblingsHeight, barPosY;

            siblings = Array.prototype.slice.call(siblings, 0, i);
            cumulativeSiblingsHeight = siblings.reduce(function(acc, sibling) {
              var data = sibling.__data__,
                  prevSiblingHeight = barHeightScale(barValue(data));
                return acc + (chartHeight - prevSiblingHeight);
            }, 0);

            barPosY = barHeightScale(barValue(d)) - cumulativeSiblingsHeight;
            return "translate(0, " + barPosY + ")";
          });

      bars
        .append("rect")
          .attr("width", intraGroupScale.rangeBand())
          .attr("height", function(d, i) {
            return chartHeight - barHeightScale(barValue(d));
          })
          .attr("fill", function(d, i) {
            return color(colorBy(d, i));
          });

      // TODO(ihodes): WIP
      stacks.append("text")
        .attr("transform", "rotate(-50)")
        .attr("dy", intraGroupScale.rangeBand()/2 - 14)
        .attr("dx", "6em")
        .style("text-anchor", "end")
        .text(function(d, idx) { return stackLabel(d.values, d.key, idx) });


      bars.append("text")
        .attr("transform", "rotate(-90)")
        .attr("dy", intraGroupScale.rangeBand()/2)
        .attr("dx", "-1em")
        .style("text-anchor", "end")
        .text(barLabel);


        ///////////////////
       // Axes & Titles //
      ///////////////////

      svg
        .append("text")
          .text(title)
          .style("text-anchor", "middle")
          .attr("class", "title")
          .attr("transform", "translate(" + chartWidth/2 + "," + -margin.top/2  + ")")

      xAxis
        .tickFormat(xTickFormatter);

      var xAxisGroup = svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0, " + chartHeight + ")")
          .call(xAxis);

      xAxisGroup.append("text")
          .attr("y", 30)
          .attr("x", chartWidth/2)
          .attr("dy", ".71em")
          .attr("class", "title")
          .style("text-anchor", "middle")
          .text(xAxisTitle);

      yAxis
        .tickFormat(yTickFormatter);

      var yAxisGroup = svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      yAxisGroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("x", 0)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text(yAxisTitle);


        //////////////
       //  Legend  //
      //////////////

      // TODO(ihodes): Legend WIP (should be in one g element, for e.g.,
      //               positioning etc)
      var legend = svg.selectAll(".legend")
          .data(color.domain().slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
          .attr("x", chartWidth + margin.left - 23)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", chartWidth + margin.left + 6 + 18 - 23)
          .attr("y", 9)
          .attr("dy", ".35em")
          .text(function(d) { return legendLabeler(d); });
    });
  }


  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return svgWidth;
    svgWidth = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return svgHeight;
    svgHeight = _;
    return chart;
  };

  chart.barValue = function(_) {
    if (!arguments.length) return barValue;
    barValue = typeof _ === 'function' ? _ : getter(_);
    return chart;
  };

  chart.xLabel = function(_) {
    if (!arguments.length) return xAxisTitle;
    xAxisTitle = _;
    return chart;
  };

  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
  };

  chart.yLabel = function(_) {
    if (!arguments.length) return yAxisTitle;
    yAxisTitle = _;
    return chart;
  };

  chart.xLabel = function(_) {
    if (!arguments.length) return xAxisTitle;
    xAxisTitle = _;
    return chart;
  };

  chart.groupBy = function(_) {
    if (!arguments.length) return groupBy;
    groupBy = typeof _ === 'function' ? _ : getter(_);
    return chart;
  };

  chart.stackBy = function(_) {
    if (!arguments.length) return stackBy;
    stackBy = typeof _ === 'function' ? _ : getter(_);
    return chart;
  };

  chart.colorBy = function(_) {
    if (!arguments.length) return colorBy;
    colorBy = typeof _ === 'function' ? _ : getter(_);
    return chart;
  };

  chart.colors = function(_) {
    if (!arguments.length) return colors;
    colors = _;
    return chart;
  };

  chart.barLabel = function(_) {
    if (!arguments.length) return barLabel;
    barLabel = typeof _ === 'function' ? _ : function() { return _; };
    return chart;
  };

  chart.stackLabel = function(_) {
    if (!arguments.length) return stackLabel;
    stackLabel = typeof _ === 'function' ? _ : getter(_);
    return chart;
  };

  chart.legendLabeler = function(_) {
    if (!arguments.length) return legendLabeler;
    legendLabeler = _;
    return chart;
  };

  chart.interGroupPadding = function(_) {
    if (!arguments.length) return interGroupPadding;
    interGroupPadding = _;
    return chart;
  };

  chart.intraGroupPadding = function(_) {
    if (!arguments.length) return intraGroupPadding;
    intraGroupPadding = _;
    return chart;
  };

  chart.yTickFormatter = function(_) {
    if (!arguments.length) return yTickFormatter;
    yTickFormatter = _;
    return chart;
  };

  chart.xTickFormatter = function(_) {
    if (!arguments.length) return xTickFormatter;
    xTickFormatter = _;
    return chart;
  };

  chart.interStackSorter = function(_) {
    if (!arguments.length) return interStackSorter;
    interStackSorter = _;
    return chart;
  };

  chart.intraStackSorter = function(_) {
    if (!arguments.length) return intraStackSorter;
    intraStackSorter = _;
    return chart;
  };


  return chart;
}

if (d3.chart === undefined)  d3.chart = {};
d3.chart.bars = d3_bars;

})();
