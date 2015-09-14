#Animation and interaction

Finally we get to the primary use of javascript in GIS: rendering maps in the browser.

If you just want to show a static map, rendering the map in the browser does not make much sense. A static image will render faster and on a wider range of devices (read about how to create one in [chapter 2](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_2_print_map)). But it is the perfect tool if you want to show a lot of data or keep your users for a little longer with animation and interaction.

##Animation basics

Create a folder for this chapter ```chapter_3_animation_interaction```

Before animating a map, we will have a look at how animation works in D3. Initialise npm and get the library.

```
npm init
npm install d3 --save
```

Create a directory ```3.1_basic_animation``` where you put a simple ```index.html``` file like this

```
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Basic animation</title>
	</head>
	<body>
		<script src="script.js"></script>
	</body>
</html>
```

Going back to ```chapter_3_animation_interaction```, create a file called ```basicAnimation.js``` and ask ```watchify``` to compile the ```script.js``` file in the folder we just created

```
watchify basicAnimation.js -o 3.1_basic_animation/script.js
```

In ```basicAnimation.js```, we require D3, create the width and height of the workspace, select the ```<body>``` and append an svg element (with the dimensions we saved as variables) to it

```
var d3 = require('d3')

var width = 300
var height = 200 

var body = d3.select('body')
var svg = body.append('svg')
	.attr({
		width: 300,
		height: 200
	})
```

Create a point in the top left corner of the svg. It will have a radius of 5 and be blue.

```
var point = svg.append('circle')
	.attr({
		cx: 0,
		cy: 0,
		r: 5,
		fill: 'blue'
	})
```

We animate the point, moving it to the bottom right corner of the svg by calling the ```point```and adding the ```transition()``` function and the attributes that need to change

```
point.transition()
	.attr({
		cx: width,
		cy: height
	})
```

Open ```basic_animation/index.html``` in a browser.

Did you see it? If not, refresh the browser. As soon as the page loads the point flies over to the opposite corner in half a second. That is the default speed of a ```transition()```. Modify the speed by adding ```.duration(2000)``` to it. 

Time is in milliseconds so default is 500 and we now want it to take two seconds to go from one corner to the other

```
point.transition()
	.duration(2000) // <-- new
	.attr({
		cx: width,
		cy: height
	})
```

Reload the page. As it goes a bit slower we have time to see it cross the screen. It still starts as soon as the page loads. Delay the transition for a second

```
point.transition()
	.delay(1000) // <-- new
	.duration(2000)
	.attr({
		cx: width,
		cy: height
	})
```

And refresh the browser again... The point waits a second before moving. 

We can add a transition after another. 

In order to move back to the center in a second add this

```
point.transition()
	.delay(1000)
	.duration(2000)
	.attr({
		cx: width,
		cy: height
	})
	.transition() // <-- new
	.duration(1000) // <-- new
	.attr({ 
		cx: width / 2,
		cy: height / 2
	}) // <-- new
```

See it in the browser

##User interaction

Append a button to the ```<body>``` of the document

```
var button = body.append('button')
	.text('Animate !')
```

Create a function that will be triggered when the user clicks on it. 

Move the whole block with the ```transition()```s into the function. You can remove the ```delay()```, we do not need it anymore

```
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
```

Refresh and click the button. There you go, user interaction.

You can trigger functions on other interactions with the mouse or the keyboard.

Log a message when the mouse hoovers over the ```<svg>``` element and another one when it is not over it anymore

```
svg.on('mouseover', function() {
	console.log('The mouse is on the svg element')
})
svg.on('mouseout', function() {
    console.log('The mouse is not on the svg element anymore')
})

```

And log the key when you use the keyboard

```
body.on('keydown', function() {
	console.log(d3.event.key)
})
```

Refresh the page, open the console and try it out

##Animating a map

We will make a map that moves between the 10 biggest populated places of the world. 

Go to ```chapter_3_animation_interaction```, create two folders, ```data``` and ```3.2_animated_map```, and copy ```3.1_basic_animation/index.html``` to ```3.2_animated_map/index.html```

Stop ```watchify``` if it is still running for the previous example, create a file called ```animatedMap.js``` and complie it to ```3.2_animated_map/script.js```.

```
watchify animatedMap.js -o 3.2_animated_map/script.js
``` 

In ```data``` we put two GeoJSON files:

```land.json``` all the landmass of the earth except Antartica. Get it [here](https://github.com/idris-maps/gis-with-javascript-tutorial/blob/master/chapter_3_animation_interaction/data/land.json)

```cities.json``` an array of the 10 most populated places from [Natural Earth populated places](http://www.naturalearthdata.com/downloads/110m-cultural-vectors/) with the following keys: ```name```, ```pop```, ```lat```, ```lng```. Get it [here](https://github.com/idris-maps/gis-with-javascript-tutorial/blob/master/chapter_3_animation_interaction/data/cities.json)

When dealing with maps that will be rendered in the browser, we have to remember that although modern browsers are very powerful, they do not handle any amount of data smoothly. The more data you throw at them the slower they are. If we want a decent experience for users on less powerful devices, we have to use the strict minimum for our purposes. We will talk more about that in the next chapter about zoomable maps. 

```land.json``` is taken from [Natural Earth countries](http://www.naturalearthdata.com/downloads/110m-cultural-vectors/), all of them except Antartica have been united into one ```MultiPolygon``` with [turf-union](https://www.npmjs.com/package/turf-union) and simplified with [mapshaper](https://www.npmjs.com/package/mapshaper). For tips about how to do that, check out the first chapter in this serie, [Geodata in javascript](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_1_geodata).



In ```animatedMap.js``` create a map with ```land.json```. For more about how to do that, check out the previous chapter, [Draw a map for print](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_2_print_map)

```
var d3 = require('d3')
var landData = require('./data/land.json')
var citiesData = require('./data/cities.json')

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
```

The only new things, if you have read the previous chapter, is that I put all configuration data under one ```config``` variable and that we use a funky projection called ```conicEquidistant()```

Open ```animated_map/index.html``` in the browser, you should see a map of the world zoomed in because of the ```.scale(500)``` part and centered on 0 longitude and 0 latitude (the default position). 

###Screen coordinates and data coordinates

We want our map to focus on our 10 cities, one after the other, and will do that by moving around the ```land``` group with ```transition()```

Tokyo, the first in our list of cities is roughly at longitude 139.75 and latitude 35.69. We will have to translate those values into pixels within the ```<svg>``` element. Use the ```projection``` function for that. 

Let's test it by logging the result

```
var tokyoCoords = projection([139.75,35.69])
console.log(tokyoCoords)
```

We get an array with the position of Tokyo relative to the svg. 

If we want to move the center of the map to Tokyo we need to find the coordinates of the current center and calculate how the whole ```land``` group should move horizontally and vertically.

We will write a function, ```moveCoords()``` that takes latitude and longitude and returns how many pixels we should move

```
function moveToCoords(lng,lat) {
	var center = projection([0,0]);
	var point = projection([lng,lat]);

	var horizontal = -(point[0] - center[0])
	var vertical =  -(point[1] - center[1])
	return [horizontal, vertical]
}
```

Remove this

```
var tokyoCoords = projection([139.75,35.69]);
console.log(tokyoCoords)
```

And add this 

```
var moveToTokyoCoords = moveToCoords(139.75,35.69)
console.log(moveToTokyoCoords)
```

We get a new array. This time with the number of pixels we should move ```land``` to have Tokyo in the middle. 

Make a transition that adds a ```transform``` attribute with those numbers

```
land.transition()
	.duration(2000)
	.attr('transform', 'translate(' + moveToTokyoCoords[0] + ' ' + moveToTokyoCoords[1] + ')')
```

Refresh the browser and watch the center move to Tokyo. 

###setInterval()

Now we want to move like this from one city to the other going through our list of cities. 

We will use ```setInterval()``` which triggers a function at regular intervals. Again, time is in milliseconds. 

Test it in the browser console (ctrl-shit-k in firefox) by loging a message every three seconds

```
setInterval(function() { console.log('hello every 3 seconds') },3000)
```

We will trigger a transition every three seconds. The starting point will be the first city in the list.

```animatedMap.js``` will look like this

```
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

//Intervals
setInterval(function() {
 //something happens every interval
}, 3000)

function moveToCoords(lng,lat) {
    var center = projection([0,0]);
    var point = projection([lng,lat]);

    var horizontal = -(point[0] - center[0])
    var vertical =  -(point[1] - center[1])
    return [horizontal, vertical]
}
```

To get a new city at every interval, add a count variable with a value of ```0``` before ```setInterval()```

```
var count = 0

setInterval(function() {

},3000)
```

Get count to be incremented by one every time until we have reached the total number of cities, then start over again. We will use ```count``` as the index of the cities array to log a new city every 3 seconds

```
var count = 0

setInterval(function() {
	count = count + 1
	if(count === cities.length) {
		count = 0
	}
	console.log(cities[count])
},3000)
```
Refresh the browser and see a new city in the console every three seconds. 

Use the cities ```lng``` and ```lat``` to transition the map instead of logging

```
var count = 0

setInterval(function() {
	count = count + 1
	if(count === cities.length) {
		count = 0
	}
	var move = moveToCoords(cities[count].lng, cities[count].lat)
	land.transition()
		.duration(2000)
		.attr('transform', 'translate(' + move[0] + ' ' + move[1] + ')')
},3000)
```

Try it in the browser.

###Points and labels

It would be good to know which city we are looking at. Lets add a point and a name. We know the city will always be in the center of the map at the end of each transition, that is where we will put them

```
var city = svg.append('g').attr('id','currentCity')

city.append('circle')
	.attr({
		cx: config.width / 2,	
		cy: config.height / 2,
		r: 5,
		fill: config.color.red
	})	

city.append('text')
	.attr({
		id: 'cityName',
		x: config.width / 2,	
		y: (config.height / 2) + 20,
		'text-anchor': 'middle'
	})
	.text(cities[0].name) // <-- start with the first name
```

We do not want the current city to be displayed during transition: we give the whole group an opacity of 0. And after 2 seconds, when the transition is over, we show it by giving it an opacity of 1 and change the text of ```#cityName```. 

Modify ```setInterval()```

```
var count = 0

setInterval(function() {
	count = count + 1
	if(count === cities.length) {
		count = 0
	}
	var move = moveToCoords(cities[count].lng, cities[count].lat)
	city.attr('opacity', 0) // <-- hide city before transition
	setTimeout(function() {
		city.attr('opacity', 1)
		d3.select('#cityName').text(cities[count].name)
	}, 2000) // <-- show it and change the name after 2 seconds
	land.transition()
		.duration(2000)
		.attr('transform', 'translate(' + move[0] + ' ' + move[1] + ')')

},3000)
```

We have an animated map that moves between the 10 most populated places on the planet.

All the code is [here](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_3_animation_interaction)

###Have fun

Now it is your turn to create interactive maps. Remember that anything can be animated: zooming and moving around the map, changing feature colors, moving points...
 
###Examples

* Animated map: [Day and night](https://rawgit.com/idris-maps/c6429ce5e1e7e1b29322/raw/) --- [code](https://github.com/idris-maps/day-night-map)
* Interactive map: [basic data about european NUTS2 regions](http://bl.ocks.org/idris-maps/raw/06a26e4a5a6f4e9ef633/)  --- [code](https://github.com/idris-maps/nuts-map)

In the next chapter we will talk about zoomable maps. 
