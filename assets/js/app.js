// Set SVG area
var svgWidth = 960;
var svgHeight = 600;

// Assign Margins
var marginSize = 50;
var margin = {
  top: marginSize,
  right: marginSize,
  bottom: marginSize * 3,
  left: marginSize * 3
};

// Determine the working area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params & constants
const xNames = ["smokes", "income", "age", "poverty"];
const yNames = ["healthcare", "obesity", "smokes"];
var xLabels = [xNames.length];
var yLabels = [];
var chosenXAxis = "smokes";
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function xScale(researchData, chosenXAxis)
{
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(researchData, d => d[chosenXAxis]) * 0.9,
        d3.max(researchData, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(researchData, chosenYAxis)
{
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(researchData, d => d[chosenYAxis]) * 0.9,
        d3.max(researchData, d => d[chosenYAxis]) * 1.1
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) 
{
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderAxesY(newYScale, yAxis)
{
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) 
{
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

 // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) 
{
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${chosenXAxis} ${d[chosenXAxis]}<br>${chosenYAxis} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

function createXAxisLabels(labels, names)
{
  let x = 0;
  let y = 20;
  let i = 0;

  console.log(`createXAxisLabels names: ${names}`);
  names.forEach(name => {
    console.log(name);
    xLabels[i] = labels.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("value", name) // value to grab for event listener
    .classed("axis-text", true)
    .classed(y === 20 ? "active" : "incactive", true)
    .classed(y === 20 ? "inactive" : "active", false)
    .text(name);
    y += 20;
    i += 1;
  });
  console.log(xLabels);
  return labels;
}

function createYAxisLabels(labels, names)
{
  let x = 0;
  let y = 0;

  console.log(`createYAxisLabels names: ${names}`);
  console.log(`xLabels = ${xLabels}`);
  names.forEach(name => 
  {
    console.log(name);
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", y - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .classed(y === 20 ? "active" : "incactive", true)
    .classed(y === 20 ? "inactive" : "active", false)
    .attr("value",name)
    .text(name);

    y += 20;
  });
  console.log(labels);
  return labels;
}

// Funcion to update the X axis labels
function updateXLabels(group, chosenXAxis)
{
  console.log(group);
  console.log(`chosenXAxis = ${chosenXAxis}`);
  group = group.forEach(name =>
  {
    console.log(`name = ${name.attr("value")}`);
    if (chosenXAxis === name.attr("value"))
      name.classed("active", true).classed("inactive", false);
    else
      name.classed("active", false).classed("inactive", true);
  });
  return group;
}

// Funcion to update the Y axis labels
function updateYLabels(group, chosenYAxis)
{
  group.forEach(name =>
  {
    if (chosenYAxis === name.text)
      name.classed("active", true).classed("inactive", false);
    else
      name.classed("active", false).classed("inactive", true);
  });
  return group;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(researchData, err) {
    if (err) throw err;
  
    // parse data and convert some fields to numeric
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
    var circlesGroup = chartGroup.selectAll("circle")
      .data(researchData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".5");
  
    //Create group for x- axis labels
    var labelsGroupX = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    // Create group for y-axis labels
    var labelsGroupY = chartGroup.append("g")
      .attr("transform", `translate(${-20}, ${height / 2})`);

    // append x axis
    labelsGroupX = createXAxisLabels(labelsGroupX, xNames);

    // append y axis
    labelsGroupY = createYAxisLabels(labelsGroupY, yNames);
    
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
    //x axis labels event listener
    labelsGroupX.selectAll("text")
      .on("click", function() 
      {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(researchData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxesX(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);


        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        labelsGroupX = updateXLabels(xLabels, chosenXAxis);
      }
    });

    //x axis labels event listener
    labelsGroupY.selectAll("text")
      .on("click", function() 
      {
        // get value of selection
        console.log("Clicked on Y");
        var value = d3.select(this).attr("value");
        console.log(`Clicked on ${value}`);
        console.log(`chosenYAxis = ${chosenYAxis}`);
        if (value !== chosenYAxis) {

        // replaces chosenXAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(researchData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderAxesY(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        labelsGroupY = updateYLabels(labelsGroupY, chosenYAxis);
      }
    });
  }).catch(function(error) {
  console.log(error);
});
  