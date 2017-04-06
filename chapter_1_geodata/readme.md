# Geodata in javascript

[GeoJSON](https://en.wikipedia.org/wiki/GeoJSON) is the standard way of storing geodata in [JSON](https://en.wikipedia.org/wiki/JSON), javascripts native data format. The [wikipedia article](https://en.wikipedia.org/wiki/GeoJSON) has very clear and telling examples. If you have never heard of GeoJSON, read it. The aim of this article is to show you how to convert your geodata to GeoJSON and some basics in querying the data.

## Convert to GeoJSON

### Shapefiles

If your geodata comes in files, probably they are [shapefiles](https://en.wikipedia.org/wiki/Shapefile). There are a number of [javascript libraries that convert shapefiles to geojson](https://www.npmjs.com/search?q=shp), we will use [shapefile](https://www.npmjs.com/package/shapefile) by Mike Bostock the creator of [D3js](http://d3js.org/), a library we will use later for visualising our data.

Create a folder for the project, open it, initialise NPM, download the library and create a folder to put the data:

```
$ mkdir 1.1_shapefiles
$ cd 1.1_shapefiles
$ npm init
$ npm install shapefile --save
$ mkdir data
```

Inside the ```/data``` folder create two other called ```/shp``` and ```/geojson```.

```
$ cd data
$ mkdir shp
$ mkdir geojson
```

Put your shapefiles in ```/shp```. For this example I took one from [Natural Earth](http://naturalearthdata.com/).

Go back to the '1.1_shapefiles' folder, create a file called ```convertShp.js``` and open it in a text editor. 

Require ```shapefile```, the library we downloaded with npm, and write the paths to our data folders:

```
var shp = require('shapefile')
var shpPath = 'data/shp/'
var geojsonPath = 'data/geojson/'
```

See if it works by converting the file and logging the result to the console:

```
shp.read(shpPath + 'ne_110m_admin_0_countries', function(err,json) {
	console.log(json)
})
```

Go back to the terminal and run the script:

```
$ node convertShp
```

You should see your GeoJSON data in the console. Now we will save it to a file. There is a library that does that very easily, [jsonfile](https://www.npmjs.com/package/jsonfile). Download it with npm:

```
$ npm install jsonfile --save
```

Open ```convertShp.js``` again and require ```jsonfile```.

```
var jf = require('jsonfile')
```

Modify the previous script by passing the output of ```shp.read()``` to ```jf```. Give the file a name. Ask the script to log 'done' in the console when it is.

```
shp.read(shpPath + 'ne_110m_admin_0_countries', function(err,json) {
	jf.writeFile(geojsonPath + 'countries.json', json, function() {
		console.log('done')
	})
})
```
Run the script with the command line:

```
$ node convertShp
```

You now have a ```countries.geojson``` file in ```/data/geojson```.

The code is [here](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_1_geodata/1.1_shapefiles)

### PostGIS

If you have geodata in a database it probably is a [PostgreSQL](http://www.postgresql.org/) db with the [postGIS](http://postgis.net/) plugin. If it is not ...change database server :) 

That was a joke about famous proprietary GIS software. Not a statement in the [debate about NoSQL databases vs postGIS](http://gis.stackexchange.com/questions/9809/best-gis-system-for-high-performance-web-application-postgis-vs-mongodb). NoSQL databases such as MongoDB already store data as JSON and are outside of the scope of this article.

Recent versions of postGIS have a [ST_AsGeoJSON](http://postgis.org/docs/ST_AsGeoJSON.html) function that enables you to convert geometries.

Try it:

```
SELECT id, ST_AsGeoJSON(geom) as geometry FROM table
```

You will get something like:

```
id;geometry
1;{type:'Point',coordinates:[0,0]}
2;{type:'Point',coordinates:[1,1]}
```

There are many npm libraries that access PostgreSQL databases, such as [pg](https://github.com/brianc/node-postgres). The problem is that the output is not exactly GeoJSON. If we use our previous query, we get a JSON array like this:

```
[
	{
		id: 1, 
		geometry: {
			type:'Point',
			coordinates:[0,0]
		}
	},
	{
		id: 2, 
		geometry: {
			type:'Point',
			coordinates:[1,1]
		}
	}
]
```

Whereas GeoJSON would look like this:

```
{
	type: 'FeatureCollection',
	features: [
		{
			type: 'Feature',
			properties: {
				id: 1
			},
			geometry: {
				type: 'Point',
				coordinates: [0,0]
			}
		},
		{
			type: 'Feature',
			properties: {
				id: 2
			},
			geometry: {
				type: 'Point',
				coordinates: [1,1]
			}
		}
	]
}
```

The geometries are right we just need to create the ```type``` and ```properties``` of every feature and put them in a feature collection. It is easy enough but, unsurprisingly, there are libraries that do that. We will be lazy and take [postgeo](https://www.npmjs.com/package/postgeo).

Create a new folder ```/1.2_postgis```, initialise npm and download ```postgeo```.

```
$ mkdir 1.2_postgis
$ cd 1.2_postgis
$ npm init
$ npm install postgeo --save
```

Create a file ```fromPostGis.js```, open it, require ```postgeo```, connect to the db and write your query:

```
var postgeo = require('postgeo')

var connectionString = 'postgres://user@host:port/database';

postgeo.connect(connectionString)
 
postgeo.query("SELECT id, ST_AsGeoJSON(geom) AS geometry FROM table", "geojson", function(data) {
    console.log(data);
})
```

Change the ```connectionString``` with your credentials and run the script:

```
$ node fromPostgis.js
```

You have your GeoJSON in the console. If you want to save it to a file, use ```jsonfile``` as we did with the shapefiles.

The code is [here](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_1_geodata/1.2_postgis)

### OpenStreetMap data

[OSM](https://www.openstreetmap.org/), is the wikipedia of geodata: a very useful resource for any mapping project. The data comes in [.osm files](http://wiki.openstreetmap.org/wiki/OSM_XML) a form of [.xml file](https://en.wikipedia.org/wiki/XML). There are a lot of ways to get OSM data, see the [wiki](http://wiki.openstreetmap.org/wiki/Downloading_data). To convert it to GeoJSON, you can use [osmtogeojson](https://github.com/tyrasd/osmtogeojson) which works as a command line tool.

Install the package globally:

```
$ sudo npm install osmtogeojson -g
```

Navigate to the folder where you have your ```file.osm``` and convert it with the following command:

```
$ osmtogeojson file.osm > file.geojson 
```

This could take some time if the .osm file is big. I would not try on [planet.osm](http://wiki.openstreetmap.org/wiki/Planet.osm) (the whole OSM dataset ~600GB) but it works fine for smaller sets. 

The GeoJSON file created this way includes all types of data (points, lines, polygons...) in one file, just like in the original .osm file. This is a good starting point for some basics in querying GeoJSON files.

## Query GeoJSON

### Loop

The main approach to working with GeoJSON data is to loop through the features. The classical method of looping through an array in javascript looks like this:

```
for(i=0;i<array.length;i++) {
	var object = array[i]
}
```

There are more modern methods of doing loops in javascript but I find this one the most clear. It is also generally [faster than other ways](http://jsperf.com/map-vs-native-for-loop/7).

In everyday language it could translate into something like "Suppose 'i' equals zero, go on as long as 'i' is less than the number of objects in the array by incrementing 'i', 'i' is the index of the array". Sounds confusing?

Say we have an array of continents:

```
var continents = ['Africa', 'America', 'Asia', 'Europe', 'Oceania']
```

The index 0 of this array (the first object) is 'Africa', index 1 is 'America', index 2 is 'Asia'... Try it in the console of your browser by copy-pasting the array and then run:

``` 
console.log(continents[2]) 
```

It logs 'Asia', the index 2 of the array. So if you do:

```
for(i=0;i<continents.length;i++) {
	var continent = continents[i];
	console.log(continent)
}
```

All continents are logged one after the other and the loop stops at the end.

### Select

Using a loop, we will now do a selection on the features of a GeoJSON file. Create a new folder, download some OSM data (I used the ```wget``` example from the [wiki](http://wiki.openstreetmap.org/wiki/Downloading_data#Download_the_data)) and convert it to GeoJSON. 

```
$ mkdir 1.3_osm
$ cd 1.3_osm
$ wget -O muenchen.osm "http://api.openstreetmap.org/api/0.6/map?bbox=11.54,48.14,11.543,48.145"
$ osmtogeojson muenchen.osm > muenchen.json
```

As said before the file will contain all types of data over the area. We will select some of it, say all the buildings.

This is not a tutorial on OSM data. There are **a lot** of properties and the data being provided by many different people, is complex to handle. But it is fairly safe to assume that a feature with a geometry type of ```'Polygon'``` or ```'MultiPolygon'```, where the property ```building``` is neither ```undefined``` nor ```'no'```, really is a building. Let us apply this logic to our file.

We will save the result as a JSON file. Initialise npm and download ```jsonfile```.

```
$ npm init
$ npm install jsonfile --save
```

Create  ```selectBuildings.js```, open it, require ```jsonfile``` and ```muenchen.json```:

```
var jf = require('jsonfile')
var data = require('./muenchen.json')
```

Create and empty ```FeatureCollection``` where we will put the buildings 

```
var buildingsCollection = {type:'FeatureCollection', features:[]}
```

Loop through the ```muenchen.json``` features and log a feature if its geometry type is ```'Polygon'``` or ```'MultiPolygon'```

```
for(i=0;i<data.features.length;i++) {
	var feature = data.features[i]
	if(feature.geometry.type == 'Polygon' || feature.geometry.type == 'MultiPolygon') {
		console.log(feature)
	}
}
```

Run the script

```
$ node selectBuildings
```

It logs all the polygons and multipolygons. We also want only features where the ```building``` property is neither ```undefined``` nor ```'no'```. Add the condition:

```
for(i=0;i<data.features.length;i++) {
	var feature = data.features[i]
	if(feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
		if(feature.properties.building !== undefined && feature.properties.building !== 'no') {
			console.log(feature)
		}
	}
}
```

If you run the script again, you see all the features that satisfy our conditions. Add the features to the ```buildingsCollection``` and save it as ```muechen_buildings.json``` with ```jsonfile```.

```
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
```

When the console says it is done, you have the file in the ```1.3_osm``` folder.

Get the code [here](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_1_geodata/1.3_osm)

### Spatial selections

The [turf](https://github.com/turfjs/turf) library describes itself as 'a modular geospatial engine written in JavaScript'. Modular means you do not need to download the whole thing, you just use the function you are interested in. Have a look at the [API](http://turfjs.org/static/docs/), there are plenty. 

As an example we will use [turf-intersect](http://turfjs.org/static/docs/module-turf_intersect.html) which takes two features and returns the intersection as a new feature, or ```undefined``` if the two features do not intersect. We will use it to select a bounding box from the countries that we got in the chapter about shapefiles.

Create a new folder ```1.4_spatial_selection```, put the ```countries.json``` file  from ```1.1_shapefiles/data``` in it and create a file ```selectBbox.js```.

Initialise npm and download ```turf-intersect``` and ```jsonfile```

```
npm init
npm install turf-intersect jsonfile --save
```

Open ```selectBbox.js```, and require the libraries and the data

```
var jf = require('jsonfile')
var intersect = require('turf-intersect')
var data = require('./countries.json')
```

```turf-intersect``` takes two features so we need to create a feature with our bounding box

```
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
```

The bounding box I chose here corresponds roughly to the Balitic sea, create a collection called ```baltic``` where we will put our selected features

```
var baltic = {type:'FeatureCollection', features: []}
```

Then we loop through the data features. On each one we check if there is an intersection with the bounding box. If there is one we save it to the ```baltic``` collection

```
for(i=0;i<data.features.length;i++) {
	var feature = data.features[i]
	var intersection = intersect(feature, bboxFeature)
	if(intersection !== undefined) {
		baltic.features.push(intersection)
	}
}
```

The problem is that we do get the geometries of countries around the baltic but have lost all information about them: the ```properties``` of the countries. We need to pass them on to the features we save. Modify the loop:

```
for(i=0;i<data.features.length;i++) {
	var feature = data.features[i]
	var properties = feature.properties // <-- keep the feature's properties
	var intersection = intersect(feature, bboxFeature)
	if(intersection !== undefined) {
		intersection.properties = properties // <-- add it to the new feature
		baltic.features.push(intersection)
	}
}
```

Save the result to a json file called ```baltic.json``` with ```jsonfile```

```
jf.writeFile('baltic.json', baltic, function() {
	console.log('done')
})
```

And run the script

```
$ node selectBbox
```

That is it. Combining loops, [turfJS functions](http://turfjs.org/static/docs/) and good old logic, you should be able to do all spatial queries you wish.

In the coming tutorials we will see how to use geodata to make real maps.

The code is [here](https://github.com/idris-maps/gis-with-javascript-tutorial/tree/master/chapter_1_geodata/1.4_spatial_selection)
