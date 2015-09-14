var d3 = require('d3')
var countriesData = require('./data/countries.json')
var linesData = require('./data/lines.json')
var pointData = require('./data/continents.json')

var body = d3.select('body')
var svg = body.append('svg')
	.attr({
		width: 800,
		height: 500
	})

var projection = d3.geo.mercator().scale(120).translate([370,300])
var pathCreator = d3.geo.path().projection(projection)

svg.selectAll('path.countries')
	.data(countriesData.features)
	.enter()
	.append('path')
	.attr({
		class: 'countries',
		d: pathCreator,
		fill: function(d) { return color(d.properties.mapcolor7) }
	})

svg.selectAll('path.lines')
	.data(linesData.features)
	.enter()
	.append('path')
	.attr({
		class: 'lines',
		d: pathCreator,
		stroke: 'black',
		'stroke-dasharray': '3 2'
	})

for(i=0;i<pointData.features.length;i++) {
	svg.append('text')
		.attr({
			x: projection(pointData.features[i].geometry.coordinates)[0],
			y: projection(pointData.features[i].geometry.coordinates)[1],
			fill: 'black',
			'text-anchor': 'middle'
		})
		.text(pointData.features[i].properties.name)
}


function color(nb) {
	if(nb === 1) { return '#fbb4ae' }
	if(nb === 2) { return '#b3cde3' }
	if(nb === 3) { return '#ccebc5' }
	if(nb === 4) { return '#decbe4' }
	if(nb === 5) { return '#fed9a6' }
	if(nb === 6) { return '#ffffcc' }
	if(nb === 7) { return '#e5d8bd' }
}
