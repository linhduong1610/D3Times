function makeResponsive() {
    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
      svgArea.remove();
    }
    var svgWidth =  d3
    .select("#scatter")
    .node()
    .getBoundingClientRect()
    .width

    var svgHeight =  svgWidth * .75

var chartMargin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - chartMargin.left - chartMargin.right;
var height = svgHeight - chartMargin.top - chartMargin.bottom;


var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

var chosenXAxis = "poverty";
var chosenYaxis = "healthcare";

function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(data, chosenYaxis) {

  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYaxis]) * 0.8,
      d3.max(data, d => d[chosenYaxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}
var radiusscale = d3.scaleLinear()
.domain([430, 1280])    
.range([10, 30]);

function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

function renderCircles(circlesGroup, newXScale, chosenXaxis) {
 
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderyCircles(circlesGroup, newyScale, chosenYaxis) {
 
    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newyScale(d[chosenYaxis]));
  
    return circlesGroup;
  }

function renderlabels(abbrGroup, newXScale, chosenXaxis) {
   
    abbrGroup.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return abbrGroup;
  }
  function renderylabels(abbrGroup, newyScale, chosenYaxis) {
   
    abbrGroup.transition()
      .duration(1000)
      .attr("dy", d => newyScale(d[chosenYaxis])+5);
  
    return abbrGroup;
  }

function updateToolTip(circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label1 = "In Poverty(%)";
  }
  else if (chosenXAxis === "age") {
    var label1 = "Age (Median)";
  }
  else {
    var label1 = "Household Income (Median)";
  }

  if (chosenYaxis === "healthcare") {
    var label2= "Lacks Healthcare (%)";
  }
  else if (chosenYaxis === "smokes") {
    var label2 = "Smokes (%)";
  }
  else {
    var label2 = "Obese (%)";
  }


  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label1} ${d[chosenXAxis]}<br>${label2} ${d[chosenYaxis]}`);
    });

  circlesGroup.call(toolTip);

    circlesGroup
        .on("mouseover", toolTip.show)
        .on("mouseout",  toolTip.hide);

  return circlesGroup;
}

d3.csv("/assets/data/data.csv").then(data => {

  data.forEach( d => {
   

    for (x = 3; x < 18; x++) {
       
       d[Object.keys(d)[x]] = +d[Object.keys(d)[x]]
       
    }
    
  });
 
  var xLinearScale = xScale(data, chosenXAxis);

  var yLinearScale = yScale(data, chosenYaxis);
    
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .call(leftAxis);


  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYaxis]))
    .attr("r", d => radiusscale(width))
    .classed("stateCircle", true)
    
    var abbrGroup =  chartGroup.selectAll('#stateText')
    .data(data)
    .enter()
    .append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d.income)+5)
        .attr("font-size", (width * 0.001) + "em")
        .text(function(d){return d.abbr})
        .classed("stateText", true)


  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(-90, ${height / 2}) rotate(-90)`)
   
    var HealthcareLabel = ylabelsGroup.append("text")
    .attr("value", "healthcare") 
    .classed("inactive", true)
    .text("Lacks Healthcare (%)")
    .attr("x", 0)
    .attr("y", 60)

    var ObesityLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") 
    .classed("inactive", true)
    .text("Obese (%)");

    var SmokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") 
    .classed("inactive", true)
    .text("Smokes (%)");
  
    var AgeLabel = labelsGroup.append("text")
    .attr("value", "age") 
    .classed("active", true)
    .text("Age (Median)")
    .attr("x", 0)
    .attr("y", 40)
  

    var IncomeLabel = labelsGroup.append("text")
    .attr("value", "income") 
    .classed("active", true)
    .text("Household Income (Median)")
    .attr("x", 0)
    .attr("y", 60)


    var PovertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") 
    .classed("active", true)
    .text("In Poverty (%)");

  var circlesGroup = updateToolTip(circlesGroup);

  labelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;

        xLinearScale = xScale(data, chosenXAxis);

        xAxis = renderAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        abbrGroup = renderlabels(abbrGroup, xLinearScale, chosenXAxis);

        circlesGroup = updateToolTip(circlesGroup);

        if (chosenXAxis === "poverty") {
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){ 
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", true)
            .classed("inactive", false);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          PovertyLabel
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
   
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenYaxis) {

        chosenYaxis = value;

        yLinearScale = yScale(data, chosenYaxis);
        yAxis = renderYAxes(yLinearScale, yAxis);

        circlesGroup = renderyCircles(circlesGroup, yLinearScale, chosenYaxis);
        abbrGroup = renderylabels(abbrGroup, yLinearScale, chosenYaxis);

        circlesGroup = updateToolTip(circlesGroup);

        if (chosenXAxis === "healthcare") {
            HealthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            SmokesLabel
              .classed("active", false)
              .classed("inactive", true);
            ObesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "smokes"){ 
            HealthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            SmokesLabel
              .classed("active", true)
              .classed("inactive", false);
            ObesityLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            HealthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            SmokesLabel
              .classed("active", false)
              .classed("inactive", true);
            ObesityLabel
              .classed("active", true)
              .classed("inactive", false);
          }
      }
    });
});
}

makeResponsive();
d3.select(window).on("resize", makeResponsive);