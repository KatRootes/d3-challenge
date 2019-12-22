// Set SVG area
var svgWidth = 960;
var svgHeight = 500;

// Assign Margins
var marginSize = 50;
var margin = {
  top: marginSize,
  right: marginSize,
  bottom: marginSize,
  left: marginSize
};

// Determine the working area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "Poverty";
var chosenYAxis = "Age";

// function used for updating x-scale var upon click on axis label
function xScale(researchData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(researchData, d => d[chosenXAxis]) * 0.9,
        d3.max(researchData, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(researchData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(researchData, d => d[chosenYAxis]) * 0.9,
        d3.max(researchData, d => d[chosenYAxis]) * 1.1
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  // Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(researchData, err) {
    if (err) throw err;
  
    // parse data
    researchData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });

    console.log(researchData);
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(researchData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(researchData, chosenYAxis);
    // var yLinearScale = d3.scaleLinear()
    //   .domain([0, d3.max(researchData, d => d.chosenYAxis)])
    //   .range([height, 0]);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    // var circlesGroup = chartGroup.selectAll("circle")
    //   .data(researchData)
    //   .enter()
    //   .append("circle")
    //   .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //   .attr("cy", d => yLinearScale(d[chosenYAxis]))
    //   .attr("r", 20)
    //   .attr("fill", "blue")
    //   .attr("opacity", ".5");
  
    //Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var hairLengthLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "hair_length") // value to grab for event listener
      .classed("active", true)
      .text("Hair Metal Ban Hair Length (inches)");
  
    var albumsLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "num_albums") // value to grab for event listener
      .classed("inactive", true)
      .text("# of Albums Released");
  
    // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Number of Billboard 500 Hits");
  
    // updateToolTip function above csv import
    // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
    // // x axis labels event listener
    // labelsGroup.selectAll("text")
    //   .on("click", function() {
    //     // get value of selection
    //     var value = d3.select(this).attr("value");
    //     if (value !== chosenXAxis) {
  
    //       // replaces chosenXAxis with value
    //       chosenXAxis = value;
  
    //       // console.log(chosenXAxis)
  
    //       // functions here found above csv import
    //       // updates x scale for new data
    //       xLinearScale = xScale(hairData, chosenXAxis);
  
    //       // updates x axis with transition
    //       xAxis = renderAxes(xLinearScale, xAxis);
  
    //       // updates circles with new x values
    //       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
  
    //       // updates tooltips with new info
    //       circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
    //       // changes classes to change bold text
    //       if (chosenXAxis === "num_albums") {
    //         albumsLabel
    //           .classed("active", true)
    //           .classed("inactive", false);
    //         hairLengthLabel
    //           .classed("active", false)
    //           .classed("inactive", true);
    //       }
    //       else {
    //         albumsLabel
    //           .classed("active", false)
    //           .classed("inactive", true);
    //         hairLengthLabel
    //           .classed("active", true)
    //           .classed("inactive", false);
    //       }
    //     }
    //   });
  }).catch(function(error) {
    console.log(error);
  });
  