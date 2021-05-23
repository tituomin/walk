mapboxgl.accessToken = 'pk.eyJ1IjoidGl0dW8iLCJhIjoiY2twMDR6dHVzMTZlaDJucWd1dGhvZ2VhaiJ9.a6ftt6lykQGAblejPgzX7Q';

let initialBounds = new mapboxgl.LngLatBounds(
    new mapboxgl.LngLat(24.846348, 60.139498),
    new mapboxgl.LngLat(25.061891, 60.231153)
);

let ANIMATED = true;
let SPEED = 5;
let CENTER_AND_FOLLOW = true;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10',
    bounds: initialBounds
});

// the zoom control doesn't work with animated setCenter
// map.addControl(new mapboxgl.NavigationControl());

let walkData;

var currentPoint = null;

var geojson = {
    'type': 'Feature',
    'properties': {},
    'geometry': {
	'type': 'LineString',
	'coordinates': []
    }
};

map.on('load', function () {
    map.addSource('line', {
	'type': 'geojson',
	'data': geojson,
	//'tolerance': 2
    });
    
    map.addLayer({
	'id': 'line-animation',
	'type': 'line',
	'source': 'line',
	'layout': {
	    'line-cap': 'round',
	    'line-join': 'miter',
	},
	'paint': {
	    'line-color': '#f36b0c',
	    'line-width': 4,
	    'line-opacity': 1
	}
    });
    
    function addPointToSource(timestamp) {
	let point;
	for (i = 0; (i < SPEED) && (currentPoint < walkData.length); i++) {
	    point = walkData[currentPoint];
	    geojson.geometry.coordinates.push([point[1], point[2]])
	    currentPoint++;
	}
	map.getSource('line').setData(geojson);
	if (CENTER_AND_FOLLOW) {
	    map.setCenter([point[1], point[2]]);
	}
	if (currentPoint < walkData.length) {
	    animation = requestAnimationFrame(addPointToSource);
	}
    }

    function processIncomingData(data) {
	if (ANIMATED) {
	    currentPoint = 0;
	    walkData = data;
	    map.setZoom(13);
	    addPointToSource();
	    return;
	}
	for (i in data) {
	    let point = data[i];
	    geojson.geometry.coordinates.push([point[1], point[2]])
	}
	map.getSource('line').setData(geojson);	

    }

    fetch('walk.json')
	.then(response => response.json().then(processIncomingData))
	.then(data => console.log(data));
    
})


