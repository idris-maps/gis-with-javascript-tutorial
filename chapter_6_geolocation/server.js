var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var event = require('./lib/serverEvents')
var users = {positions:[]}

app.use('/css', express.static(__dirname + '/public/css'))
app.use('/js', express.static(__dirname + '/public/js'))
app.use('/images', express.static(__dirname + '/public/images'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html')
})

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

http.listen(3000, function(){
  console.log('listening on port 3000...')
})
