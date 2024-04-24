// It seems that in raw html/js import don't work, but you can 
// destructure like this to get members
const { select, json, geoPath, geoNaturalEarth1 } = d3;
const { feature } = topojson;


const svg = select('svg.worldMap');

const projection = geoNaturalEarth1();
const pathGenerator = geoPath().projection(projection);

svg.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));

const mouseOverFcn = function(d) {
    select(this)
        .classed('country', false)
        .classed('highlight-country', true);
}

const mouseOutFcn = function(d) {
    select(this)
        .classed('highlight-country', false)
        .classed('after-highlight', true);
    // This works but is kinda verbose
        // .style('fill', '#2E841F')
        // .style('stroke-width', 1)
        // .style('stroke-opacity', 0.3)
    // Watch out for these being attr vs style!
    // It seems like they are attr, but are actually style in this case.
}

json('https://unpkg.com/world-atlas@1.1.4/world/110m.json')
    .then(data => {
        const countries = feature(data, data.objects.countries);
        svg.selectAll('path')
            .data(countries.features)
            .enter().append('path')
            .classed('country', true)
            .attr('d', pathGenerator)
            .on('mouseover', mouseOverFcn)
            .on('mouseout', mouseOutFcn)
    });

