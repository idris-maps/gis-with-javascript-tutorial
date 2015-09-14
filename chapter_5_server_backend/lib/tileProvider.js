exports.url = function(s,z,x,y,callback) {
	var path = 'http://' + s + '.tile.openstreetmap.org/' + z +'/' + x + '/' + y + '.png'
	callback(path)
}

exports.attr = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

