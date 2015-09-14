var L = require('leaflet')
var heat = require('./lib/heat')
heat(L)
var tilebelt = require('tilebelt')

var data = require('./data/places_tiles.json')

L.Icon.Default.imagePath = 'images'

var map = L.map('map').setView([53.55, 9.99], 11)

L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
	attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

var latlngs = []
for(i=0;i<data.length;i++) {
	var tile = data[i]
	for(j=0;j<tile.features.length;j++) {
		var f = tile.features[j]
		var c = f.geometry.coordinates
		latlngs.push([c[1],c[0]])
	}
}

var heatmap = L.heatLayer(latlngs).addTo(map)

map.on('moveend', function() {
	var zoom = map.getZoom()
	var bounds = map.getBounds()
	removeMarkers()
	if(zoom >= 16) { 
		map.removeLayer(heatmap) 
		getTiles(bounds, 16, function(tiles) {
			getFeatures(tiles, data, function(features) { 
				for(i=0;i<features.length;i++) {
					var f = features[i]
					var c = f.geometry.coordinates
					L.marker([c[1],c[0]]).addTo(map)
				}
			}) 
		})
	}
	if(zoom < 16) { map.addLayer(heatmap) }
})

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

function removeMarkers() {
	var markerPane = document.getElementsByClassName('leaflet-marker-pane')
	var shadowPane = document.getElementsByClassName('leaflet-shadow-pane')
	markerPane[0].innerHTML = ''
	shadowPane[0].innerHTML = ''
}
