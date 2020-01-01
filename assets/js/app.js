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
const xNames = ["income", "age", "poverty"];
const xAxisText = ["Household Income (Median)", "Age (Median)", "In Poverty (%)"];
const yNames = ["healthcare", "obesity", "smokes"];
const yAxisText = ["Lacks Healthcare (%)", "Obese (%)", "Smokes (%)"];
var xLabels = [xNames.length];
var yLabels = [yNames.length];
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(researchData, chosenXAxis)
{
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(researchData, d => d[chosenXAxis]) * 0.8,
        d3.max(researchData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(researchData, chosenYAxis)
{
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(researchData, d => d[chosenYAxis]) * 0.8,
        d3.max(researchData, d => d[chosenYAxis]) * 1.2
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
function renderCircles(circlesGroup, textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) 
{
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis])+5);

  return circlesGroup;
}

 // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) 
{
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${chosenXAxis} ${d[chosenXAxis]}<br>${chosenYAxis} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
    textGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

    textGroup.on("mouseover", function(data) {
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
  names.forEach(name => 
  {
    console.log(name);
    xLabels[i] = labels.append("text")
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("value", name) // value to grab for event listener
    .classed(name === chosenXAxis ? "active" : "inactive", true)
    .text(xAxisText[i]);
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
  let i = 0;

  console.log(`createYAxisLabels names: ${names}`);
  console.log(`yLabels = ${yLabels}`);
  names.forEach(name => 
  {
    console.log(name);
    yLabels[i] = labels.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", y - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("text-anchor", "middle")
    .attr("dy", "1em")
    .classed(name === chosenYAxis ? "active" : "inactive", true)
    .attr("value",name)
    .text(yAxisText[i]);

    y += 20;
    i += 1;
  });
  console.log(yLabels);
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
    if (chosenYAxis === name.attr("value"))
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
      data.abbr = data.abbr;
      data.id = +data.id;
      data.state = data.state;
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });

    // for(let z=0; z<researchData.length; z++)
      // console.log(researchData[z].abbr);

    // console.log(researchData);
  
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
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);
  
    // console.log(`researchData.length = ${researchData.length}`);
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(researchData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .classed("stateCircle", true);

      // for(let z=0; z<researchData.length; z++)
        // console.log(`x = ${researchData[z].age} y = ${researchData[z].obesity} text = ${researchData[z].abbr}`);

      // console.log(`researchData.length = ${researchData.length}`);
    var textGroup = chartGroup.selectAll("p")
      .data(researchData)
      .enter()
      .append("text")
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis])+2.5)
      .classed("stateText", true);

       console.log(textGroup);
      //  console.log(textGroup2);
      // console.log(`researchData.length = ${researchData.length}`);

      let minX = 1000, maxX = -1, minY = 1000, maxY = -1;
      for(let z=0; z<researchData.length; z++)
      {
        console.log(`x = ${researchData[z][chosenXAxis]} y = ${researchData[z][chosenYAxis]} text = ${researchData[z].abbr}`);
        minX = minX < researchData[z][chosenXAxis] ? minX : researchData[z][chosenXAxis];
        minY = minY < researchData[z][chosenYAxis] ? minY : researchData[z][chosenYAxis];
        maxX = maxX > researchData[z][chosenXAxis] ? maxX : researchData[z][chosenXAxis];
        maxY = maxY > researchData[z][chosenYAxis] ? maxY : researchData[z][chosenYAxis];
      }
      console.log(`minX ${minX} minY ${minY} maxX ${maxX} maxY ${maxY}`);

    //Create group for x- axis labels
    var labelsGroupX = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    // Create group for y-axis labels
    var labelsGroupY = chartGroup.append("g")
      .attr("transform", `translate(${0}, ${height / 8})`);

    // append x axis
    labelsGroupX = createXAxisLabels(labelsGroupX, xNames);

    // append y axis
    labelsGroupY = createYAxisLabels(labelsGroupY, yNames);
    
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);
  
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
        circlesGroup = renderCircles(circlesGroup, textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);


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
        circlesGroup = renderCircles(circlesGroup, textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        labelsGroupY = updateYLabels(yLabels, chosenYAxis);
      }
    });
  }).catch(function(error) {
  console.log(error);
});
  