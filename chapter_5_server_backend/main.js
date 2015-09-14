var L = require('leaflet')
var heat = require('./lib/heat')
heat(L)

var provider = require('./lib/tileProvider')

L.Icon.Default.imagePath = 'images'

var map = L.map('map').setView([53.55, 9.99], 11)

L.tileLayer('/tiles/{s}/{z}/{x}/{y}', {
	attribution: provider.attr
}).addTo(map)

var latlngs = require('./data/latlngs.json')
var heatmap = L.heatLayer(latlngs).addTo(map)

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

function removeMarkers() {
	var markerPane = document.getElementsByClassName('leaflet-marker-pane')
	var shadowPane = document.getElementsByClassName('leaflet-shadow-pane')
	markerPane[0].innerHTML = ''
	shadowPane[0].innerHTML = ''
}

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
