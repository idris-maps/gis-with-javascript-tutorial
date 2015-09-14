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

exports.disconnect = function(socketId, map, users) {
 	findLeafletId(socketId, users, function(leafletId) {
 	 	removeMarker(leafletId, map)
 	 	removeFromList(leafletId, users)
 	})
}

exports.connect = function(positions, map, users) {
 	for(i=0;i<positions.length;i++) {
 	 	var position = positions[i]
 	 	createUser(position, map, users)
 	}
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

function removeMarker(leafletId, map) {
 	map.eachLayer(function(layer) {
 	 	if(layer._leaflet_id === leafletId) {
 	 	 	map.removeLayer(layer)
 	 	}
 	})
}

function removeFromList(position, users) {
 	var newList = []
 	for(i=0;i<users.list.length;i++) {
 	 	if(users.list[i].socketId !== position.socketId) {
 	 	 	newList.push(users.list[i])
 	 	}
 	}
 	users.list = newList
}
