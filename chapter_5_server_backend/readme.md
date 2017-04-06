# Server for zoomable maps

This chapter is a continuation of the previous one about [Zoomable maps](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_4_zoomable). Last time we were left with the problem of a too big script file because we send all the data immediatly when the user opens the map. 

In this chapter we will solve that problem by moving some logic from the browser to the server. This is the beauty of using the same language on the server as on the client. If you ever wondered why node has become so popular as a server environment, you will soon see why.

### Setup

Create a folder called ```chapter_5_server_backend```.

Initialise npm and download the libraries we used in the previous chapter [leaflet](http://leafletjs.com/) and [tilebelt](https://www.npmjs.com/package/tilebelt) as well as a new one called [express](http://expressjs.com/) that will let us create the server

```
npm init
npm install leaflet tilebelt express --save
```

Copy the ```data```, ```lib``` and ```public``` directories from [chapter 4](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_4_zoomable).  

You can also copy the ```main.js``` file from the previous chapter into ```chapter_5_server_backend``` and compile it into ```chapter_5_server_backend/public/script.js``` with watchify

```
watchify main.js -o public/script.js
```

If you open ```chapter_5_server_backend/public/index.html``` in a browser, it is what we had at the end of chapter 4. 

### Create a server

Create a file called ```server.js```, this will be where we write the server. Open it, require ```express``` and create an ```app``` variable.

```
var express = require('express')
var app = express()
```

We want to be able to send the content of the folders in ```public```: ```public/css``` and ```public/images``` 

```
app.use('/css', express.static(__dirname + '/public/css'))
app.use('/images', express.static(__dirname + '/public/images'))
```

... and serve the ```index.html``` and ```script.js``` files

```
app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html')
})
app.get('/script.js', function(req, res){
	res.sendFile(__dirname + '/public/script.js')
})
```

Create a ```port``` variable, ask the server to listen to that port and log a message when the server has started

```
var port = 3000
app.listen(port, function() {
	console.log('Listening on port ' + port + '...')
})
```

Before starting the server we need to do some modifications on the ```chapter_5_server_backend/public/index.html``` file. It is just about adding ```/``` in front of the ```href``` of the ```<link>``` elements in the header and in front of the ```src``` of the ```<script>```. 

They will not come from the file system but from the server. For example, before the ```script.js``` file was taken from the same folder, now it comes from the server at this adress ```http://localhost:3000/script.js```, the server + ```/``` + ```script.js```

It should look like this:

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
        <script src="/script.js"></script>
    </body>
</html>
```

Open a new terminal window and start the server

```
node server
```

And go to this URL in the browser ```http://localhost:3000/```. Our map is served but it is still the same. Lets see how we can make it lighter. 

#### Remove the data from the browser script

Open ```main.js``` and remove the line that requires the data.

```
var data = require('./data/places_tiles.json')
```

We did two things with the data in ```main.js```:
* created the ```latlngs``` array for the heatmap
* got the markers at zoom level 16 and higher.

#### The ```latlngs``` array

We will create the ```latlngs``` array beforehand so that it does not need to be done in the browser. We will write it to a ```.json``` file, download the [jsonfile](https://www.npmjs.com/package/jsonfile) library.

```
npm install jsonfile --save
```

Create a file called ```createLatLngs.js``` in ```chapter_5_server_backend```

Remove this part from ```main.js```

```
var latlngs = []
for(i=0;i<data.length;i++) {
	var tile = data[i]
	for(j=0;j<tile.features.length;j++) {
		var f = tile.features[j]
		var c = f.geometry.coordinates
		latlngs.push([c[1],c[0]])
	}
}
```

... and copy it into ```createLatLngs.js``` where you also have to require the data, ```/data/places_tiles.json```,  and ```jsonfile```.

And save ```latlngs``` to a file in the ```data``` folder called ```latlngs.json``` with ```jsonfile```s ```writeFile()``` function.

It should look like this

```
var data = require('./data/places_tiles.json')
var jf = require('jsonfile')

var latlngs = []
for(i=0;i<data.length;i++) {
	var tile = data[i]
	for(j=0;j<tile.features.length;j++) {
		var f = tile.features[j]
		var c = f.geometry.coordinates
		latlngs.push([c[1],c[0]])
	}
}

jf.writeFile('data/latlngs.json', latlngs, function() {
	console.log('latlngs was saved to data/latlngs.json')
})
```

Run the script

```
$ node createLatLngs
```

You now have a file called ```latlngs.json``` in the ```data``` folder. As it will be used from start in the map we will require it in ```main.js``` before creating the heatmap with it.

```
var latlngs = require('./data/latlngs.json') // <-- new
var heatmap = L.heatLayer(latlngs).addTo(map)
```

#### Move the markers to the server

We want the server to send the markers. We will not send the whole dataset at once but only the part needed for the current map view. Open ```main.js``` and copy the ```getTiles()``` and ```getFeatures()``` functions to ```server.js``` as we want that part to be done there. 

Remove them from ```main.js```. 

It is this part

```
function getTiles(bounds, zoom, callback) {
	var tileMin = tilebelt.pointToTile(bounds._southWest.lng, bounds._southWest.lat, zoom)
	var tileMax = tilebelt.pointToTile(bounds._northEast.lng, bounds._northEast.lat, zoom)
	var tiles = []
	for(i=tileMin[0];i<tileMax[0] + 1;i++) {
		for(j=tileMax[1];j<tileMin[1] + 1;j++) {
			tiles.push([i,j])
		}
	}
	callback(tiles)
}

function getFeatures(tiles, data, callback) {
	var features = []
	for(i=0;i<tiles.length;i++) {
		var tile = tiles[i]
		for(j=0;j<data.length;j++) {
			var tileData = data[j]
			if(tileData.x === tile[0] && tileData.y === tile[1]) {
				for(k=0;k<tileData.features.length;k++) {
					features.push(tileData.features[k])
				}
			}
		}
	}
	callback(features)
}
```

We are using ```tilebelt``` on the server this time, remove this line from ```main.js``` 

```
var tilebelt = require('tilebelt')
```

... and copy it to the top of ```server.js```

Create an endpoint where the map can ask the server for the markers it needs. Before the ```app.listen()``` function add this

```
app.get('/markers/:minLng/:maxLng/:minLat/:maxLat', function(req,res) {
	var minLng = req.params.minLng 
	var maxLng = req.params.maxLng 
	var minLat = req.params.minLat
	var maxLat = req.params.maxLat
})
```

The endpoint has four parameters: the minimum and maximum latitudes and longitudes of our map view. 

Modify the ```getTiles()``` function so that it takes these instead of ```bounds```

```
function getTiles(minLng, maxLng, minLat, maxLat, zoom, callback) {
	var tileMin = tilebelt.pointToTile(minLng, minLat, zoom)
	var tileMax = tilebelt.pointToTile(maxLng, maxLat, zoom)
	var tiles = []
	for(i=tileMin[0];i<tileMax[0] + 1;i++) {
		for(j=tileMax[1];j<tileMin[1] + 1;j++) {
			tiles.push([i,j])
		}
	}
	callback(tiles)
}
```

The ```getFeatures()``` function needs the data from ```places_tiles.json``` (that we removed from ```main.js```), require it at the beginning of ```server.js```

```
var data = require('./data/places_tiles.json')
```

Use ```getTiles()``` and ```getFeatures()``` in the ```/marker``` endpoint to return the requested features

```
app.get('/markers/:minLng/:maxLng/:minLat/:maxLat', function(req,res) {
	var minLng = req.params.minLng 
	var maxLng = req.params.maxLng 
	var minLat = req.params.minLat
	var maxLat = req.params.maxLat
// new from here
	getTiles(minLng, maxLng, minLat, maxLat, 16, function(tiles) {
		getFeatures(tiles, data, function(features) {
			res.send(features)
		})
	})
// to here
})
```

Restart the server by stopping it if it is running, ```ctrl - c``` and starting it with

```
$ node server
```

Try it by going to ```http://localhost:3000/markers/9.975/10.005/53.547/53.552``` and see the features returned

#### Get data from the server in the browser script

Now that the server is ready, go back to ```main.js``` and add a function that ```GET```s a URL, like the one above, and returns the data 

```
function getData(url, callback) {
	var request = new XMLHttpRequest()
	request.open('GET', url, true)
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
		  callback(JSON.parse(request.responseText))
		}
	}
	request.send()
}
```

Use it to get the markers by modifying the ```moveend``` event

Remove the ```getTiles()``` and ```getFeatures()``` functions, they are on the server now

```
map.on('moveend', function() {
	var zoom = map.getZoom()
	var bounds = map.getBounds()
	removeMarkers()
	if(zoom >= 16) { 
		map.removeLayer(heatmap) 
		getTiles(bounds, 16, function(tiles) { // <-- to remove
			getFeatures(tiles, data, function(features) { // <-- to remove
				for(i=0;i<features.length;i++) {
					var f = features[i]
					var c = f.geometry.coordinates
					L.marker([c[1],c[0]]).addTo(map)
				} 
			}) // <-- to remove
		}) // <-- to remove
	}
	if(zoom < 16) { map.addLayer(heatmap) }
})
```

Create variables for the minimum and maximum longitudes and latitudes, ask the server to return the features and add them as markers

```
map.on('moveend', function() {
	var zoom = map.getZoom()
	var bounds = map.getBounds()
	removeMarkers()
	if(zoom >= 16) { 
		map.removeLayer(heatmap) 
	
// Create four variables with the bounds object
		var minLng = bounds._southWest.lng
		var minLat = bounds._southWest.lat
		var maxLng = bounds._northEast.lng
		var maxLat = bounds._northEast.lat
// Use them to create the URL that we have to connect to
		var url = '/markers/' + minLng + '/' + maxLng + '/' + minLat + '/' + maxLat
// Trigger the getData() function, passing it the URL. 
		getData(url, function(features) {
// For each feature returned by the server, add a marker
			for(i=0;i<features.length;i++) {
				var f = features[i]
				var c = f.geometry.coordinates
				L.marker([c[1],c[0]]).addTo(map)
			} 
		})
	}
	if(zoom < 16) { map.addLayer(heatmap) }
})
```

Now the map will ask for the marker features on every ```moveend``` if the zoom level is 16 or higher.

Make sure ```watchify``` has compiled the new ```main.js``` to ```public/script.js```. If not restart watchify in another terminal 

```
$ watchify main.js -o public/script.js
```

And go to ```http://localhost:3000/``` in the browser. 

The map loads faster as the ```script.js``` file is now only 300KB as opposed to the 1.2MB we had before. There is a bit more time between when the markers are removed and the new ones added because it has to ask the server.

With this set (about 2600 features), we have the choice between sending it all at once or using a server backend. But if you have more points, maybe millions, then you can not possibily load all data at start. You have too use a server. Most likely with a database behind instead of a json file. There are many libraries that let you connect to databases like [mongodb](https://www.npmjs.com/package/mongodb) for MongoDB or [pg](https://www.npmjs.com/package/pg) for PostgreSQL.

All the code is [here](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_5_server_backend)

## Tile cache

There is one last point I want to talk about concerning zoomable maps, the raster tiles.

Suppose you make a map that becomes really popular and you use freely available tiles from OpenStreetMap like we did  here. Maintenance of tile servers can be expensive and most do not appreciate that you abuse them. Which might be your case if you have a lot of users.

You could subscribe to a paid plan from [geofabrik](http://www.geofabrik.de/maps/tiles.html), [mapbox](https://www.mapbox.com/pricing/) or someone else. It is generally not very expensive. But if it makes sense to you to use your server's computer power instead, you can cache tiles.

### How it works

When a tile is requested by a user you first check if you already have it. If not you get it for her and keep it so that you can serve it next time it is asked for.

### Setup

I have created a script for express servers that does just that. It is on [this github page](https://github.com/idris-maps/cache-tiles). 

Download the three files in the [lib folder of the repository](https://github.com/idris-maps/cache-tiles/tree/master/lib)

* [cacheTiles.js](https://raw.githubusercontent.com/idris-maps/cache-tiles/master/lib/cacheTiles.js)
* [createFolderIfNotExist](https://raw.githubusercontent.com/idris-maps/cache-tiles/master/lib/createFolderIfNotExist.js)
* [tileProvider.js](https://raw.githubusercontent.com/idris-maps/cache-tiles/master/lib/tileProvider.js)

Put them in your ```lib``` folder

Download [request](https://www.npmjs.com/package/request), a library that will enable the server to request the tiles.

```
$ npm install request --save
```

Require ```/lib/cacheTiles.js``` and create a ```/tile``` endpoint in ```server.js```

```
var cacheTiles = require('./lib/cacheTiles')

app.get('/tiles/:s/:z/:x/:y', function(req,res) {
	var s = req.params.s
	var z = req.params.z
	var x = req.params.x
	var y = req.params.y
	cacheTiles.getTileIfNotExist(s,z,x,y, function() {
		res.sendFile(__dirname + '/data/tiles/' + z + '/' + x + '/' + y + '.png')
	})
})
```

Create the needed folders at start by modifying the ```app.listen()``` callback

```
app.listen(port, function() {
	cacheTiles.init(function() { // <-- new
		console.log('"data/tiles" folder has been initialised') // <-- new
		console.log('Listening on port ' + port + '...')
	}) // <-- new
})
```

The default tiles are OSM classic. If you want to change that (to 'hydda' that we used here for example), open ```lib/tileProvider.js``` and change the ```url``` and ```attr``` accordingly

To use 'hydda', it should look like this:

```
exports.url = function(s,z,x,y,callback) {
	var path = 'http://' + s + '.tile.openstreetmap.se/hydda/full/' + z +'/' + x + '/' + y + '.png'
	callback(path)
}

exports.attr = 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
```

You will find more possibilities [here](http://leaflet-extras.github.io/leaflet-providers/preview/) with URLs and appropriate attribution.

In ```main.js```, require ```provider.js```

```
var provider = require('./lib/provider')
```

And modify ```L.tileLayer()``` to ask your server for the tiles

```
L.tileLayer('/tiles/{s}/{z}/{x}/{y}', {
	attribution: provider.attr
}).addTo(map)
```

Restart the server, open the map and move around. 

Go to the ```/data/tiles``` folder and see newly created folders with the cached tiles.

**Before caching tiles, verify that it is allowed by the tile provider you are using and do not forget to attribute the tiles to whom you got them from.**
