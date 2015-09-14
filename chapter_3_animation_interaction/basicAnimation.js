var d3 = require('d3')

var width = 300
var height = 200 

var body = d3.select('body')
var svg = body.append('svg')
	.attr({
		width: 300,
		height: 200
	})

var point = svg.append('circle')
	.attr({
		cx: 0,
		cy: 0,
		r: 5,
		fill: 'blue'
	})


var button = body.append('button')
	.text('Animate !')

button.on('click', function() {
	point.transition()
		.duration(2000)
		.attr({
			cx: width,
			cy: height
		})
		.transition()
		.duration(1000)
		.attr({
			cx: width / 2,
			cy: height / 2
		})
})

svg.on('mouseover', function() {
	console.log('The mouse is on the svg element')
})
svg.on('mouseout', function() {
	console.log('The mouse is not on the svg element anymore')
})
body.on('keydown', function() {
	console.log(d3.event.key)
})


