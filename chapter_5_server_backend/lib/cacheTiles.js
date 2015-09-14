var fs = require('fs')
var request = require('request')

var folder = require('./createFolderIfNotExist')
var provider = require('./tileProvider')

exports.init = function(callback) {
	folder('data', function(dataFolderList) {
		folder('data/tiles', function(tilesFolderList) {
			callback()
		})
	})
}

exports.getTileIfNotExist = function(s,z,x,y, callback) {
	folder('data/tiles/' + z, function(zFolderList) {
		folder('data/tiles/' + z + '/' + x, function(xFolderList) {
			checkIfTileExist(xFolderList, y, function(exist) {
				if(exist === false) {
					dlTile(s,z,x,y, function() {
						callback()
					})
				} else {
					callback()
				}
			})
		})
	})
}

function checkIfTileExist(xFolderList, y, callback) {
	var exist = false
	for(i=0;i<xFolderList.length;i++) {
		var yFile = xFolderList[i].split('.')[0]
		if(yFile === y) {
			exist = true
			break
		}
	}
	callback(exist)
}


function download(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
  })
}

function dlTile(s,z,x,y, callback) {
	provider.url(s,z,x,y, function(url) {
		var imgPath = 'data/tiles/' + z + '/' + x + '/' + y + '.png'
		download(url, imgPath, function(){
			callback()
		})
	})
}

