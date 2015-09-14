var jf = require('jsonfile')
var data = require('./muenchen.json')

var buildingsCollection = {type:'FeatureCollection', features:[]}

for(i=0;i<data.features.length;i++) {
	var feature = data.features[i]
	if(feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
		if(feature.properties.building !== undefined && feature.properties.building !== 'no') {
			buildingsCollection.features.push(feature)
		}
	}
}

jf.writeFile('muechen_buildings.json', buildingsCollection, function() {
	console.log('done')
})
