var data = require('./data/places_tiles.json')
var jf = require('jsonfile')

var latlngs = []
for(i=0;i<data.length;i++) {
	var tile = data[i]
	for(j=0;j<tile.features.length;j++) {
		var f = tile.features[j]
		var c = f.geometry.coordinates
		latlngs.push([c[1],c[0]])
	}
}

jf.writeFile('data/latlngs.json', latlngs, function() {
	console.log('latlngs was saved to data/latlngs.json')
})

