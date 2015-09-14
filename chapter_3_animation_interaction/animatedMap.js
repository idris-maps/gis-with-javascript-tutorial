var d3 = require('d3')
var landData = require('./data/land.json')
var cities = require('./data/cities.json')

var config = {
	width: 960,
	height: 500,
	scale: 500,
	animTime: 3000,
	color: {
		blue: '#a6cee3',
		green: '#b2df8a',
		red: '#e31a1c'	
	}
}

var projection = d3.geo.conicEquidistant()
	.scale(config.scale)

var pathCreator = d3.geo.path().projection(projection)

var svg = d3.select('body').append('svg')
	.attr({
		width: config.width,
		height: config.height
	})

var background = svg.append('rect')
	.attr({
		x: 0,
		y: 0,
		width: config.width,
		height: config.height,
		fill: config.color.blue
	})

var land = svg.append('g').attr('id', 'land')

land.selectAll('path')
	.data(landData.features)
	.enter()
	.append('path')
	.attr({
				id: function(d) { return d.properties.name},
		class: 'countries',
				d: pathCreator,
				fill: config.color.green,
				stroke: config.color.green
	})

//Start
var firstCityCoords = moveToCoords(cities[0].lng, cities[0].lat)
land.attr('transform', 'translate(' + firstCityCoords[0] + ' ' + firstCityCoords[1] + ')')

var count = 0

//Intervals
setInterval(function() {
	count = count + 1
	if(count === cities.length) {
		count = 0
	}
	var move = moveToCoords(cities[count].lng, cities[count].lat)
	land.transition()
		.duration(2000)
		.attr('transform', 'translate(' + move[0] + ' ' + move[1] + ')')
}, 3000)

function moveToCoords(lng,lat) {
	var center = projection([0,0]);
	var point = projection([lng,lat]);

	var horizontal = -(point[0] - center[0])
	var vertical =  -(point[1] - center[1])
	return [horizontal, vertical]
}
