exports.position = function(position, users) {
 	checkIfInPositions(position, users, function(answer) {
 	 	if(answer === false) {
 	 	 	addUser(position, users)
 	 	} else {
 	 	 	updatePosition(position, users)
 	 	}
 	})
}

exports.disconnect = function(socketId, users) {
 	var newPositions = []
 	for(i=0;i<users.positions.length;i++) {
 	 	if(users.positions[i].socketId !== socketId) {
 	 	 	newPositions.push(users.positions[i])
 	 	}
 	}
 	users.positions = newPositions
}

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

function addUser(position, users) {
 	users.positions.push(position)
}

function updatePosition(position, users) {
 	for(i=0;i<users.positions.length;i++) {
 	 	if(users.positions[i].socketId === position.socketId) {
 	 	 	users.positions[i].lat = position.lat
 	 	 	users.positions[i].lng = position.lng 	
 	 	}
 	}
}



