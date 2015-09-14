var fs = require('fs')

module.exports = function(path, callback) {
	openFolder(path, function(exist, list) {
		if(exist === false) {
			fs.mkdir(path, function() {
				callback([])
			})
		} else {
			callback(list)
		}
	})
}

function openFolder(path,callback) {
	fs.readdir(path, function(err, list) {
		if(err) { callback(false, null) }
		else {
			if(list === undefined) {
				callback(false, null)
			} else {
				callback(true, list)
			}
		}
	})
}
