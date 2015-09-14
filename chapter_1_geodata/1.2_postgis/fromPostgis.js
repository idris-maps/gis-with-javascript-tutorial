var postgeo = require('postgeo')

var connectionString = 'postgres://user@host:port/database';

postgeo.connect(connectionString)

postgeo.query("SELECT id, ST_AsGeoJSON(geom) AS geometry FROM table", "geojson", function(data) {
	console.log(data);
})
