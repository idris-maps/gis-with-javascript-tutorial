var L = require('leaflet')
L.Icon.Default.imagePath = 'images'

var io = require('socket.io-client')
var socket = io()

var event = require('./lib/clientEvents')

var map = L.map('map').setView([0.5,0.5], 8)

var users = {list:[]}

getPositionFake(function(lat,lng) {
 	socket.emit('position', lat, lng)
})

socket.on('user move', function(position) {
 	event.move(position, map, users)
})

socket.on('user disconnect', function(socketId) {
 	event.disconnect(socketId, map, users)
})

socket.on('user first connection', function(positions) {
 	event.connect(positions, map, users)
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

function getPositionFake(callback) {
 	setInterval(function() {
 	 	var lat = Math.random()
 	 	var lng = Math.random()
 	 	callback(lat, lng)
 	},2000)
}
