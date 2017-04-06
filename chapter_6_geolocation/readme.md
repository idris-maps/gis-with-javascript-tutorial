# Geolocation and fleet tracking

In the last chapter of our series about GIS with javascript we will talk about **geolocation**, how to get the position of the user, and **fleet tracking**, how to have a real-time view of all the users positions.

## Setup

Like in the previous chapter we will use [express](http://expressjs.com/) for the server and [leaflet](http://leafletjs.com/) for the map.

Create a ```chapter_6_geolocation``` folder, initialise npm and download the libraries

```
npm init
npm install express leaflet --save
```

Within ```chapter_6_geolocation```, create a ```public``` folder with:
* the ```public/css``` folder from [chapter 5](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_5_server_backend)
* the ```public/images``` folder from [chapter 5](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_5_server_backend)
* a ```public/js``` folder for our ```script.js```
* a ```index.html``` file like this:

```
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
		<title></title>
		<link rel="stylesheet" href="/css/leaflet.css" />
		<link rel="stylesheet" href="/css/style.css" />
	</head>
	<body>
		<div id="map"></div>
		<script src="/js/script.js"></script>
	</body>
</html>
```

In ```chapter_6_geolocation```, create a ```server.js``` with a basic the server listening on port 3000

```
var express = require('express')
var app = express()

app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/images', express.static(__dirname + '/public/images'))

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html')
})

app.listen(3000, function(){
  console.log('listening on port 3000...')
})
``` 

Start the server

```
$ node server 
``` 

Create a ```main.js``` file, requiring leaflet

```
var L = require('leaflet')
L.Icon.Default.imagePath = 'images'

var map = L.map('map').setView([0.5,0.5], 8)
```

That is compiled into ```public/js/script.js``` with watchify in a new terminal window

```
$ watchify main.js -o public/js/script.js
```

## Geolocation

The [W3C](https://en.wikipedia.org/wiki/World_Wide_Web_Consortium), has agreed on a standard way of getting the current position of a browser. If you are interested in the details, check out the specifications [here](http://dev.w3.org/geo/api/spec-source.html). What it means is that we can get the GPS position in the same way from [most browsers](http://caniuse.com/#search=geolocation).

Open ```main.js``` and add the following

```
if ("geolocation" in navigator) {
	navigator.geolocation.watchPosition(function(position) {
		console.log(position)
	})
} else {
	alert('Your browser does not support geolocation')
}
```

This script checks first if geolocation is enabled in the browser (if not there is an alert), then watches for changes in the position and logs it to the console.

Open a browser, go to ```http://localhost:3000/```, accept to share your location and have a look in the console. We regularly get an object with two keys: ```timestamp``` and ```coords```. What we are interested in are the latitude and longitude. Make a function that returns them as a callback and log the result

Change the script like this

```
getPosition(function(lat,lng) {
	console.log(lat,lng)
})

function getPosition(callback) {
	if ("geolocation" in navigator) {
		navigator.geolocation.watchPosition(function(position) {
			var lat = position.coords.latitude
			var lng = position.coords.longitude
			callback(lat,lng)
		})
	} else {
		alert('Your browser does not support geolocation')
	}
}
```

As you are doing this on a computer, the coordinates returned are always the same. Which is not very interesting for the second part of this tutorial, fleet tracking. We will thus create a function that returns fake coordinates every 2 seconds for testing purposes

```
function getPositionFake(callback) {
	setInterval(function() {
		var lat = Math.random()
		var lng = Math.random()
		callback(lat, lng)
	},2000)
}
```

This function will return random latitudes and longitudes between 0 and 1. We will be in the middle of the Atlantic.

Remove the logging

```
getPosition(function(lat,lng) {
	console.log(lat,lng)
})
```

## Fleet tracking

Suppose we have a fleet of vehicules that we need to track. As we are in the ocean, we will say they are boats. We want to see them moving around on a map in real time.

### Real time

There is a good real time engine for node that works well with express: [socket.io](http://socket.io/). You can use it to write a chat program or collaborative tools. We will use it to get a user's position and broadcast it back to all the other users.

Install it for the server

```
$ npm install socket.io --save
```

And for the client 

```
$ npm install socket.io-client --save
```

Require it in ```server.js``` and catch the http variable from our existing server,  ```app```

```
var http = require('http').Server(app)
var io = require('socket.io')(http)
```

Change ```app.listen()``` to ```http.listen()```

```
http.listen(3000, function(){
  console.log('listening on port 3000...')
})
```

Test it by creating a ```count``` variable that will keep track of the number of users. When a user connects to the server or disconnects from it: update ```count``` and log the information to the servers console

```
var count = 0
io.on('connection', function(socket) {
	count = count + 1
	console.log('a user connected. there are ' + count + ' users')
	socket.on('disconnect', function() {
		count = count - 1
		console.log('a user disconnected. there are ' + count + ' users')
  })
})
```

In ```main.js```, require ```socket.io-client``` to connect to the server

```
var io = require('socket.io-client')
var socket = io()
```

Restart the server

```
$ node server
```

Open ```http://localhost:3000/``` in the browser. 

In the terminal in which you started the server, you should see

```
'a user connected. there are 1 users'
```

Open other browser windows and close them, see the changes in the console.

Now we want each client to send its position to the server that will then send it to all other clients

In ```main.js```, get the fake position and emit it

```
getPositionFake(function(lat,lng) {
	socket.emit('position', lat, lng)
})
```

In ```server.js``` listen to ```'position'``` and pass the latitude and longitude as well as the clients id (automatically generated) on to all clients. We will call this event ```'user move'``` The io part of the server looks like this

```
io.on('connection', function(socket) {
	socket.on('disconnect', function() {
// ...
	})
// new from here
  socket.on('position', function(lat,lng){
		var position = { lat: lat, lng: lng, socketId: socket.id}
		io.emit('user move', position)
	})
// to here
})
```

The client has to listen to ```'user move'```. Go back to ```main.js``` and add

```
socket.on('user move', function(position) {
	console.log(position)
})
```

When a 'user move' event is emitted, it will be logged to the clients consoles.

Restart the server, open a few windows in the browser and check the console of one of them. We get the new positions of all the connected users as they happen.

So now we want to see them on our map. 

### Showing the positions on a map

Create a folder called ```lib``` in ```chapter_6_geolocation``` with a file called ```clientEvents.js``` where we will tell the client what to do to the map when an event happens.

As we saw earlier, ```socket.io``` automatically generates an id to keep track of clients. Similarly ```leaflet``` gives another id to every feature to keep track of them. In order to move and remove items on the map according to events from the server, we need to be able to say to which user from the server a marker on the map corresponds.

In ```main.js``` we create a ```users``` variable with an array called ```list``` where we will have all current users with their respective ids from ```socket.io``` and ```leaflet```.

```
var users = {list:[]}
```

The ```'user move'``` event from the server broadcasts all new positions including our own. 

In ```lib/clientEvents,js```, write a function that responds to the event. It will need ```position``` from the server, the ```map``` from leaflet and the ```users``` variable we created in ```main.js``` to keep track of the list of users

```
exports.move = function(position, map, users) {

}
```

We need to write a few functions to:

* Check if the user is already in the ```users.list```

```
function isInList(position, users, callback) {
	var answer = false
	for(i=0;i<users.list.length;i++) {
		if(position.socketId === users.list[i].socketId) {
			answer = true
			break
		}
	}
	callback(answer)
}
```

If it is not, we need to create it by:

* Adding a marker to the map, getting its leaflet id and adding leafletId and socketId to the users list

```
function createUser(position, map, users) {
	var marker = L.marker([position.lat,position.lng]).addTo(map)
	var leafletId = marker._leaflet_id
	users.list.push({socketId: position.socketId, leafletId: leafletId})
}
```

If it already is in the list we need to

* Find the leaflet id that corresponds to the socketId of ```position```

```
function findLeafletId(socketId, users, callback) {
	var leafletId = null
	for(i=0;i<users.list.length;i++) {
		if(socketId === users.list[i].socketId) {
			leafletId = users.list[i].leafletId
			break
		}
	}
	callback(leafletId)
}
```

* and move the corresponding marker on the map

```
function moveMarker(position, leafletId, map) {
	map.eachLayer(function(layer) {
		if(layer._leaflet_id === leafletId) {
			layer.setLatLng({lat:position.lat, lng: position.lng})
		}
	})
}
```

Putting it all together ```clientEvents.js``` now looks like this

```
exports.move = function(position, map, users) {
	isInList(position, users, function(answer) {
		if(answer === false) {
			createUser(position, map, users)
		} else {
			findLeafletId(position.socketId, users, function(leafletId) {
				moveMarker(position, leafletId, map)
			})
		}
	})
}

function isInList(position, users, callback) {
	var answer = false
	for(i=0;i<users.list.length;i++) {
		if(position.socketId === users.list[i].socketId) {
			answer = true
			break
		}
	}
	callback(answer)
}

function createUser(position, map, users) {
	var marker = L.marker([position.lat,position.lng]).addTo(map)
	var leafletId = marker._leaflet_id
	users.list.push({socketId: position.socketId, leafletId: leafletId})
}

function findLeafletId(socketId, users, callback) {
	var leafletId = null
	for(i=0;i<users.list.length;i++) {
		if(socketId === users.list[i].socketId) {
			leafletId = users.list[i].leafletId
			break
		}
	}
	callback(leafletId)
}

function moveMarker(position, leafletId, map) {
	map.eachLayer(function(layer) {
		if(layer._leaflet_id === leafletId) {
			layer.setLatLng({lat:position.lat, lng: position.lng})
		}
	})
}
```

There is another event that will be important: when a user disconnects we need to

* remove the marker from the map

```
function removeMarker(leafletId, map) {
	map.eachLayer(function(layer) {
		if(layer._leaflet_id === leafletId) {
			map.removeLayer(layer)
		}
	})
}
```

* and remove it from the users list

```
function removeFromList(position, users) {
	var newList = []
	for(i=0;i<users.list.length;i++) {
		if(users.list[i].socketId !== position.socketId) {
			newList.push(users.list[i])
		}
	}
	users.list = newList
}
```

Exporting it as ```.disconnect()``` we add this to ```clientEvents.js```:

```
exports.disconnect = function(socketId, map, users) {
	findLeafletId(socketId, users, function(leafletId) {
		removeMarker(leafletId, map)
		removeFromList(leafletId, users)
	})
}
```

When the client connects for the first time we want to load all the already connected users, show them on the map and add them to the users list. This event does not yet exist in the server, we will write it later

```
exports.connect = function(positions, map, users) {
	for(i=0;i<positions.length;i++) {
		var position = positions[i]
		createUser(position, map, users)
	}
}
```

In ```main.js```, require ```lib/clientEvents```

```
var event = require('./lib/clientEvents')
```

And call ```event.move()``` when we get ```'user move'``` from the server

```
socket.on('user move', function(position) {
	event.move(position, map, users)
})
```

Add a listener for a server event we are not broadcasting yet, ```'user disconnect'``` and trigger ```event.disconnect()``` when it happens

```
socket.on('user disconnect', function(socketId) {
	event.disconnect(socketId, map, users)
})
```

Add a listener for ```'user first connection'``` triggering ```event.connect()```

```
socket.on('user first connection', function(positions) {
	event.connect(positions, map, users)
})
```

### The server events

In ```server.js``` we also need to keep track of a list of users so that we can send all the connected users positions to a client that connects for the first time.

Create a ```users``` variable in ```server.js``` with a ```positions``` array

```
var users = {positions:[]}
```

In ```lib``` create a file called ```serverEvents.js``` and open it

When a ```'position'``` comes in from a client we need to update our positions list, if the client already is in it, or add him, if he is not. We will create some functions that:

* check if the client is already in ```users.positions```

```
function checkIfInPositions(position, users, callback) {
	var answer = false
	for(i=0;i<users.positions.length;i++) {
		if(users.positions[i].socketId === position.socketId) {
			answer = true
			break
		}
	}
	callback(answer)
} 
```
* add the user when he is not

```
function addUser(position, users) {
	users.positions.push(position)
}
``` 

* update the position if he is

```
function updatePosition(position, users) {
	for(i=0;i<users.positions.length;i++) {
		if(users.positions[i].socketId === position.socketId) {
			users.positions[i].lat = position.lat
			users.positions[i].lng = position.lng	
		}
	}
}
```

The ```.position()``` we export looks like this 

```
exports.position = function(position, users) {
	checkIfInPositions(position, users, function(answer) {
		if(answer === false) {
			addUser(position, users)
		} else {
			updatePosition(position, users)
		}
	})
}
```

When a client disconnects we need to remove it from ```users.positions```

```
exports.disconnect = function(socketId, users) {
	var newPositions = []
	for(i=0;i<users.positions.length;i++) {
		if(users.positions[i].socketId !== socketId) {
			newPositions.push(users.positions[i])
		}
	}
	users.positions = newPositions
}
```

In ```server.js```, require 'lib/serverEvents.js'

```
var event = require('./lib/serverEvents')
```

And modify the ```io``` part to trigger the events when needed

```
io.on('connection', function(socket) {
	socket.on('disconnect', function() {
		event.disconnect(socket.id, users) // <-- new
	})
	socket.on('position', function(lat,lng) {
		var position = { lat: lat, lng: lng, socketId: socket.id}
		io.emit('user move', position)
		event.position(position, users) // <-- new
	})
})
```

When a user connects for the first time we need to send her ```'user first connection'``` with the list of all connected users

```
io.on('connection', function(socket) {
	io.to(socket.id).emit('user first connection', users.positions) // <-- new
	socket.on('disconnect', function() {
		event.disconnect(socket.id, users)
	})
	socket.on('position', function(lat,lng) {
		var position = { lat: lat, lng: lng, socketId: socket.id}
		io.emit('user move', position)
		event.position(position, users)
	})
})
```

When a user disconnects we need to send ```'user disconnect'``` to all remaining clients with its socketId

```
io.on('connection', function(socket){
	io.to(socket.id).emit('user first connection', users.positions)
	socket.on('disconnect', function() {
		io.emit('user disconnect', socket.id) // <-- new
		event.disconnect(socket.id, users)
	})
	socket.on('position', function(lat,lng) {
		var position = { lat: lat, lng: lng, socketId: socket.id}
		io.emit('user move', position)
		event.position(position, users)
	})
})
```

Restart the server and open a few browser windows at ```http://localhost:3000/```

We have a very basic but functionning fleet tracker.

The code is [here](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_6_geolocation)

### Fine tuning

If we want to try it out with real data, change ```getPositionFake()``` to ```getPosition()``` to emit the position and connect to your server with moving mobile phones.

When we played with fake data, we knew the latitudes and longitudes would be between 0 and 1 so we could have a map view centered on 0.5 north, 0.5 west. Now that we use real GPS points we want each client to have the marker representing itself in the center.

For that we need to know which socketId corresponds to oneself. We will ask the server to send that information on ```'user first connection'```

Modify ```server.js``` from

```
io.on('connection', function(socket){
	io.to(socket.id).emit('user first connection', users.positions)

// ...

})
```

to

```
io.on('connection', function(socket){
	io.to(socket.id).emit('user first connection', users.positions, socket.id)

// ...

})
```

Modify ```main.js``` to grab it on ```'user first connection'```. Change this

```
socket.on('user first connection', function(positions) {
	event.connect(positions, map, users)
})
```

To this

```
socket.on('user first connection', function(positions, mySocketId) {
	users.mySocketId = mySocketId
	event.connect(positions, map, users)
})
```

to save the clients socketId to the ```users``` variable as ```users.mySocketId```

In ```lib/clientEvents.js```, add two functions

* to see if the 'user move' is me (the client)

```
function isMe(position, callback) {
	if(position.socketId === users.mySocketId) {
		callback(true)
	} else {
		callback(false)
	}
}
```

* and to center the map on my position if that is the case

```
function centerMapOnMe(position, map) {
	map.setView([position.lat, position.lng], 10)
}
```

Modify ```exports.move()``` to check if I am the one moving and, if yes, center the map on the position

```
exports.move = function(position, map, users) {
	isInList(position, users, function(answer) {
		if(answer === false) {
			createUser(position, map, users)
		} else {
			findLeafletId(position.socketId, users, function(leafletId) {
				moveMarker(position, leafletId, map)
			})
		}
	})
// new from here
	isMe(position, function(answer) {
		if(answer === true) {
			centerMapOnMe(position, map)
		}
	})
// to here
}
```

That's all folks. 

I hope you enjoyed this [series about GIS with javascript](https://github.com/idris-maps/gis-with-javascript-tutorial). I am Anders at [idris-maps](http://www.idris-maps.com), Contact us on [twitter](https://twitter.com/IdrisMaps) if you have any questions or wish to hire me.
