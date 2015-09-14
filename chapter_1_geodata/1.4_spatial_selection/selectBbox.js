var jf = require('jsonfile')
var intersect = require('turf-intersect')
var data = require('./countries.json')

var bbox = {
	minLng: 7.294,
	minLat: 53.014,
	maxLng: 31.905,
	maxLat: 66.758
}

var bboxFeature = {
	type: 'Feature',
	properties: {},
	geometry: {
		type: 'Polygon',
		coordinates: [[
			[bbox.maxLng, bbox.minLat], 
			[bbox.maxLng, bbox.maxLat], 
			[bbox.minLng, bbox.maxLat], 
			[bbox.minLng, bbox.minLat], 
			[bbox.maxLng, bbox.minLat]
		]]
	}
}

var baltic = {type:'FeatureCollection', features: []}

for(i=0;i<data.features.length;i++) {
	var feature = data.features[i]
	var properties = feature.properties // <-- keep the feature's properties
	var intersection = intersect(feature, bboxFeature)
	if(intersection !== undefined) {
		intersection.properties = properties // <-- add it to the new feature
		baltic.features.push(intersection)
	}
}

jf.writeFile('baltic.json', baltic, function() {
	console.log('done')
})


