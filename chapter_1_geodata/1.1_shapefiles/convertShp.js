var shp = require('shapefile')
var shpPath = 'data/shp/'
var geojsonPath = 'data/geojson/'
var jf = require('jsonfile')

shp.read(shpPath + 'ne_110m_admin_0_countries', function(err,json) {
	jf.writeFile(geojsonPath + 'countries.json', json, function() {
		console.log('done')
	})
})
