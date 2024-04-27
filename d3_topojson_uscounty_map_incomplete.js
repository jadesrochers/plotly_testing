//// This was supposed to be a d3 sample of creating a US county map. 
// The environment it is supposed to run in is the observablehq
// plotting environment, so I need to work out how to port this 
// to a plain html/js/css setup and see what that can do.
// It was wrapped in a chart = {} object, but I am near certain that 
// tells Observable what to plot, so I would likely instead select
// an element in my html and add that instead.


const { select, json, geoPath, geoNaturalEarth1 } = d3;
const urlGeojsonCounties = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json'
const urlGeojsonStates = './geojson_us_states_5m.json'
const urlTopojsonStates = './topojson_us_states_5m.json'
// d3.csv('./bimonthly_covid19_confirmed_US.csv', plotCsvData)

async function fetchUrl(url){
    let response = await fetch(url)
    let data = await response.json()
    return data
}

let val = 0.05
let vals = []
while (val <=1) {
    vals.push(val.toPrecision(2))
    val += 0.05
}
let turbos = vals.map(d3.interpolateTurbo)
const color = d3.scaleQuantize([1, 500000], turbos);
const path = d3.geoPath();
const format = d => `${d}%`;

// The statemesh is just the internal borders between states, i.e.,
// everything but the coastlines and country borders. This avoids an
// additional stroke on the perimeter of the map, which would 
// mask intricate features such as islands and inlets. (Try removing
// the last argument to topojson.mesh below to see the effect.)
// const statemesh = topojson.mesh(us, us.objects.states, (a, b) => a !== b);


const createTooltip = function() {
    let Tooltip = d3.select("#mapContainer")
   .append("div")
    .classed("tooltip", true)
    .classed("tooltipOff", true)
    return Tooltip
}

const mouseover = function(d) {
    // Make the tooltip visible
   Tooltip
    .classed("tooltipOff", false)
    .classed("tooltipOn", true)
    // highlight the county
    d3.select(this)
    .style("stroke", "black")
    .style("stroke-width", 1.5)
    .style("opacity", 1)
}

const mousemove = function(e, d, stateMap, valueMap) {
    Tooltip
    .style("left", (d3.pointer(e, this)[0]+30) + "px")
    .style("top", (d3.pointer(e, this)[1]) + "px")
    .html(`${d.properties.NAME}, ${stateMap.get(d.properties.STATE).NAME} <br> ${valueMap.get(d.id)} Cases`)
}

const mouseleave = function(e) {
    Tooltip
      // .style("opacity", 0)
      .classed("tooltipOff", true)
      .classed("tooltipOn", false)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.9)
}

function configureSvg(svgElement) {
    svgElement
        .attr("width", 975)
        .attr("height", 610)
        .attr("viewBox", [0, 0, 975, 610])
        .attr("style", "max-width: 100%; height: auto;");
    return svgElement
}

function legendElement(svgElement) {
    svgElement.append("g")
        .attr("transform", "translate(610,20)")
        .attr("width", 960)
        .attr("height", 600)
        // .append(() => Legend(color, {title: "Covid Confirmed Infections", width: 260}));
    return svgElement
}

function appendUsStates(svgElement, stateMesh, geoGenerator) {
    svgElement.append("path")
        .datum(stateMesh)
        .attr("fill", "none")
        .attr("stroke", "#c9d9dc")
        .attr("class", "statesOutline")
        .attr("stroke-width", 1.2)
        .attr("stroke-linejoin", "round")
        .attr("d", geoGenerator);
    return svgElement
}

function appendUsCounties(svgElement, countyFeature, stateMap, valueMap, geoGenerator) {
    svgElement.append("g")
        .selectAll("path")
        .data(countyFeature.features)
        .join("path")
        .on("mouseover", mouseover)
        .on("mousemove", (e, d) => mousemove(e, d, stateMap, valueMap))
        .on("mouseleave", mouseleave)
        .attr("class", "countyDataPath")
        .attr("fill", d => color(valueMap.get(d.id)))
        .attr("stroke-width", 0.3)
        .attr("stroke", "#c9d9dc")
        .attr("d", geoGenerator)
        .style("opacity", 0.9)
        .append("title")
    return svgElement
}

let colorByDate = (covidData, stateMap) => (date) => {
    let valueMap = new Map(covidData.map(d => [d.GEO_ID, Number(d[date])]));
    d3.selectAll("path.countyDataPath")
    .attr("fill", d => color(valueMap.get(d.id)))
    .on("mousemove", (e, d) => mousemove(e, d, stateMap, valueMap))
}

function timeSlider() {
    // It does use YY/mm/dd, yay.
    let start = new Date(2020, 4, 1)
    let end = new Date(2023, 3, 15)
    let scaleT = d3.scaleTime()
    .domain([start, end])
    .range([0, (18 + 24 + 24 + 6 - 1)])
    return scaleT 
}

async function plotCsvData() {
    let covidData = await d3.csv('./bimonthly_covid19_confirmed_US.csv')
    let valueMap = new Map(covidData.map(d => [d.GEO_ID, Number(d['10/1/21'])]));
    // I created the us-states topojson using this cli command: 
    // geo2topo us-states=geojson_us_states_5m.json > topojson_us_states_5m.json
    // Get it on system with: npm install -g topojson-server
    let countyGeojson = await fetchUrl(urlGeojsonCounties)
    let stateGeojson = await fetchUrl(urlGeojsonStates)
    let stateTopojson = await fetchUrl(urlTopojsonStates)

    let projection = d3.geoAlbersUsa();
    let geoGenerator = d3.geoPath().projection(projection);
    // Get individual coordinate conversion to see if things line up
    let coord = projection(stateGeojson.features[36].geometry.coordinates[0][0][0])
    // Get the feature path from the feature
    // let pathy = generator(stateGeojson.features[36])

    const stateMap = new Map(stateGeojson.features.map(d => [d.id, d.properties]));
    const statemesh = topojson.mesh(stateTopojson, stateTopojson.objects.usStates, (a, b) => a !== b);
    let svg = d3.select("svg.usaCountyMap")
    svg = configureSvg(svg)
    // Not working atm, this was observable based. Source code 
    // could be pulled and used however.
    // svg = legendElement(svg)
    svg = appendUsCounties(svg, countyGeojson, stateMap, valueMap, geoGenerator)
    svg = appendUsStates(svg, statemesh, geoGenerator)
    window.reColor = colorByDate(covidData, stateMap)
    window.Tooltip = createTooltip()
    console.log('intial coloring done')

    // Yes, this works. The previous data binding (county data)
    // is still usable, you don't need to refresh it.
    // If I could not pass a new map that would be even better.
    // valueMap = new Map(covidData.map(d => [d.GEO_ID, Number(d['4/1/20'])]));
    // reColor(stateMap, valueMap)
    let scale = timeSlider()
    console.log('Play with time')
}

function dateFormChange() {
    let covidYear = document.getElementById("covidYear").value;
    let covidMonth = document.getElementById("covidMonth").value;
    let covidDay = document.getElementById("covidDay").value;
    let selectDate = new Date(covidYear, covidMonth, covidDay);
    let formattedDate = `${selectDate.getMonth() + 1}/${selectDate.getDate()}/${selectDate.getFullYear() % 100}`
    console.log('Heres the date: ', formattedDate);
    reColor(formattedDate)
}


plotCsvData()
