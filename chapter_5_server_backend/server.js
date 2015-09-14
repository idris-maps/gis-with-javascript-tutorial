var tilebelt = require('tilebelt')
var express = require('express')
var app = express()

var data = require('./data/places_tiles.json')

app.use('/css', express.static(__dirname + '/public/css'))
app.use('/images', express.static(__dirname + '/public/images'))

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html')
})
app.get('/script.js', function(req, res){
	res.sendFile(__dirname + '/public/script.js')
})

app.get('/markers/:minLng/:maxLng/:minLat/:maxLat', function(req,res) {
	var minLng = req.params.minLng 
	var maxLng = req.params.maxLng 
	var minLat = req.params.minLat
	var maxLat = req.params.maxLat
	getTiles(minLng, maxLng, minLat, maxLat, 16, function(tiles) {
		getFeatures(tiles, data, function(features) {
			res.send(features)
		})
	})
})

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

var port = 3000
app.listen(port, function() {
	cacheTiles.init(function() {
		console.log('"data/tiles" folder has been initialised')
		console.log('Listening on port ' + port + '...')
	})
})



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
