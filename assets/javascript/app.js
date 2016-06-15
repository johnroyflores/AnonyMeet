// Group Project 

// cannot have initMap wait for document ready since
// google map API call is asynchronous

var map;
var markers = [];
function initMap() {

	var styles = [
		{featureType: 'water',
		 stylers: [
		 	{color: '#fff'}
		 ]},
		 {featureType: 'administrative',
		  elementType: 'labels.text.stroke',
		 stylers: [
		 	{color: '#fff'},
		 	{weight: 8}
		 ]},
		 {featureType: 'transit.station',
		 stylers: [
		 	{hue: '#e85113'},
		 	{weight: 9}
		 ]}
		 ];



	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 30.2672, lng: -97.7431},
		zoom: 13,
		styles: styles,
		mapTypeControl: false
	});
	// this is the location for the marker
	// you can make this an array of marker objects
	//var tribeca = {lat: 40.719526, lng: -74.0089934};
	var locations = [
		{title: 'Park Ave Penthouse', location: {lat: 30.2600, lng: -97.7400}},
		{title: 'Chelsea Loft', location: {lat: 30.5555, lng: -97.8888}}

	];

	var largeInfowindow = new google.maps.InfoWindow();

	//style the markers
	var defaultIcon = makeMarkerIcon('0091ff');
	var highlightedIcon = makeMarkerIcon('FFFF24');

	for (var i = 0; i<locations.length; i++) {
		// get the position from the locations array
		var position = locations[i].location;
		var title = locations[i].title;
		//create marker per location and push into markers array
		var marker = new google.maps.Marker({
			position: position,
			title: title,
			icon: defaultIcon,
			animation: google.maps.Animation.DROP,
			id: i
		});
		// push the marker to our array of markers
		markers.push(marker);
		// create an onclick event to topen an infowindow at each marker
		marker.addListener('click', function(){
			populateInfoWindow(this,largeInfoWindow);
		});

		marker.addListener("mouseover", function(){
			this.setIcon(highlightedIcon);
		});
		marker.addListener("mouseout", function(){
			this.setIcon(defaultIcon);
		});
	}



	function populateInfoWindow(marker, infowindow) {
		// check to make sure the infowindow is not already opened in this marker.
		if (infowindow.marker != marker) {
			infowindow.marker = marker;
			infowindow.setContent('<div>'+marker.title+'</div>');
			infowindow.open(map, marker);
			// make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function(){
				infowindow.setMarker(null);
			});
		}
	}


	function makeMarkerIcon(markerColor){
		var markerImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_spin&chld=1.15|0|"+ markerColor + "|40|_|%E2%80%A2",
			new google.maps.Size(21,34),
			new google.maps.Point(0,0),
			new google.maps.Point(10,34),
			new google.maps.Size(21,34));
		return markerImage;
	};

$('#show-listing').on("click", function(event){
	event.preventDefault();
	console.log("You ARE HERE");
	var bounds = new google.maps.LatLngBounds();
	// extend the boundaries of the map for each marker
	for (var i=0; i < markers.length; i++) {
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
	};
	map.fitBounds(bounds);
});

$('#hide-listing').on("click", function(event){
	event.preventDefault();
	for (var i=0; i < markers.length; i++) {
		markers[i].setMap(null);
	};
});



};

$(document).ready(function(){
	console.log ("hello");
})
