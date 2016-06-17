// AnonyMeet 

//*****************************************************
//  MAP RELATED MODULES
//******************************************************

// cannot have initMap wait for document ready since
// google map API call is asynchronous

var map;

var spots = [];
var locations = [];
	
// locations for personA and personB in lat lng
// placeholder for results from Geocoding module
var latLngPersonA;
var latLngPersonB;

// location for midpoint in lat lng
var midpoint;


// in case we want to style the map
// 

var styles = [
	{featureType: 'water',
	  	stylers: [
	  	{color: '#000000'}
		]},
	{featureType: 'administrative',
	  	elementType: 'labels.text.stroke',
		stylers: [
		{color: '#ffffff'},
		{weight: 8}
		]},
	{featureType: 'transit.station',
		stylers: [
		{hue: '#e85113'},
		{weight: 9}
		]}
	];

// Constructor creates a new map - only center and zoom are required.
// NOTE:  WE SHOULD CENTER MAP ON MIDPOINT BETWEEN PERSON A AND PERSON B
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 30.2672, lng: -97.7431},
		zoom: 18,
		styles: styles,
		mapTypeControl: false
		});

	};

$(document).ready(function(){

// *********************************************
//  PLACEHOLDER FOR GEOCODING MODULE
//
// get lat lng of personA and personB addresses
// store results in vars latLngPersonA and latLngPersonB
latLngPersonA =	{lat: 30.2600, lng: -97.7400};
latLngPersonB = {lat: 30.5555, lng: -97.8888};




// **********************************************
// PLACEHOLDER FOR CALCULATION OF MIDPOINT BETWEEN PERSON A AND PERONS B 
//- midpoint used in places service call below

midpoint = new google.maps.LatLng(30.2600, -97.7400);


	


//*************************************************
// PLACES SERVICE - GET NEARBY PLACES
// using Google Maps Places service with Nearby Search Request
// Can specify type of places and radius (in meters) from specified location
// Specified location should be midpoint between personA and personB
// You get a result of 20 places
// Result stored in local 'spots' object
// ** will need to store in firebase as well ??
// 
//  uses var midpoint calculated from module above

var serviceP = new google.maps.places.PlacesService(map);

var request = {
	location: midpoint,
	radius: '500',
	types: ['restaurant']
	};

// this is the pop-up window that appears when you
// click on a marker
var largeInfowindow = new google.maps.InfoWindow();
var marker;
//style the markers.  we use highlightedIcon
//when user hovers over the marker
var defaultIcon = makeMarkerIcon('0091ff');
var highlightedIcon = makeMarkerIcon('FFFF24');

// FUNCTIONS USED IN PLACES CALLBACK FUNCTION 'FINDPLACES'
// 1. makeMarkerIcon - stylize markers
// 2. createMarker - marker created for each place
// 3. populateInfoWindow - add place name to infoWindow

// function for stylizing the markers.  Not sure I understand
// the call yet.  Need to look into this further.
//
function makeMarkerIcon(markerColor){
	var markerImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_spin&chld=1.15|0|"+ markerColor + "|40|_|%E2%80%A2",
		new google.maps.Size(21,34),
		new google.maps.Point(0,0),
		new google.maps.Point(10,34),
		new google.maps.Size(21,34));
	return markerImage;
	};

function createMarker(place) {

	//create marker per location and place on map
	marker = new google.maps.Marker({
		map: map, // this places the marker on the map
		position: place.geometry.location,
		icon: defaultIcon,
		animation: google.maps.Animation.DROP,
	//		id: i
		});

	// create an onclick event to open an infowindow at each marker
	marker.addListener('click', function(){

		populateInfoWindow(this,largeInfowindow, place.name);
		});

	marker.addListener("mouseover", function(){
		this.setIcon(highlightedIcon);
		});

	marker.addListener("mouseout", function(){
		this.setIcon(defaultIcon);
		});
	};



// *************** NEED TO STYLE INFO WINDOWS BETTER
function populateInfoWindow(marker, infowindow, placeName) {
	// check to make sure the infowindow is not already opened in this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		infowindow.setContent(placeName);
		infowindow.open(map, marker);
		// make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick', function(){
			infowindow.setMarker(null);
			});
		}
	};

// callback function for Places API call


function findPlaces (results, status){
	if (status == google.maps.places.PlacesServiceStatus.OK) {

	// for each place found, store results in 'spots' object
	// and create a marker and place marker on the map
	// NOTE:  20 is probably too many.
	//  Maybe we should limit it to the top 5??
	//  Then create markers for just those top 5 ???
	//  Need to figure out how to match up the top 5 for
	//  each user (personA and personB)

	// create LatLngBounds instance that capture SW and NE corners of viewport
		var bounds = new google.maps.LatLngBounds();
		for (var i=0; i < 6; i++) {
			var place = results[i];
			// we suse the spots object to save the information
			// used for the html table
			spots.push({
				name: place.name,
				position: place.geometry.location,
				address: place.vicinity,
				photo: place.icon

				});
			// Have to create a separate array with just
			// the locations for use in the distance matrix
			// *** HECTOR - I'm hoping that there is one to one correspondence between the spots object and the locations array.  Is there a better way of doing this?  Some sort of array mapping?
			locations.push(place.geometry.location);
			createMarker(results[i]);
			// extend boundaries of map for each marker
			bounds.extend(place.geometry.location);
			}
		map.fitBounds(bounds);

	}
	else console.log (status);

	//  now that you have the places stored in the 'spots' object,
	//  find the distance from each spot to personA 
	//  Once we use Firebase, we can change personA to User
	//  ** NOTE FOR HECTOR - I can't figure out how to save the 'locations'
	//  object data	in a way that I can access it oustide of the PLACES
	//  callback function.  What am I doing wrong?  Or is that just
	//  the way Google Map APIs work?

	doDistanceMatrix();
	};

// API call through Google Places JavaScript Library
serviceP.nearbySearch(request, findPlaces);

//*****************************************************
//CODE FOR DISTANCE MATRIX SERVICE
// get distance matrix information for yourLocation versus 
// all places returned from Places API call
 //  other person will do the same thing, and then
 // save the data to Firebase

var serviceD = new google.maps.DistanceMatrixService();


function doDistanceMatrix(){


	serviceD.getDistanceMatrix(
		{ 
		origins: [latLngPersonA],
		destinations: locations,
		travelMode: google.maps.TravelMode.DRIVING,
		// transitOptions: TransitOptions,
		// drivingOptions: DrivingOptions,
		// unitSystem: UnitSystem,
		avoidHighways: false,
		avoidTolls: false,
		}, calcMatrix);

	function calcMatrix (response, status){
		if (status == google.maps.DistanceMatrixStatus.OK) {
			var origins = response.originAddresses;
			var destinations = response.destinationAddresses;

			for (var i=0; i < origins.length; i++) {
				var results = response.rows[i].elements;
				for (var j=0; j < results.length; j++) {
					var element = results[j];
					var distance = element.distance.text;
					var duration = element.duration.text;
					var from = origins[i];
					var to = destinations[j];


					var newRow = $("<tr>");
						
					createNewRow();
					newRow.find('#name').html(spots[j].name);
					newRow.find('#address').html(to);
					newRow.find('#distYou').html(distance);
					newRow.find('#timeYou').html(duration);
					$('#tableDiv').append(newRow);
					}
				}
			$('#yourLocDiv').append("Your Location: " + from+"<br>");

			function createNewRow(){
				newRow.append("<td id='name'></td>")
				newRow.append("<td id='address'></td>")
				newRow.append("<td id='distYou'></td>")
				newRow.append("<td id='timeYou'></td>")
				newRow.addClass('option');
				newRow.attr( "data-name", spots[j].name);
				newRow.attr( "data-address", spots[j].address);


				//newRow.append("<td id='distThem'></td>")
				//newRow.append("<td id='timeThem'></td>")
				}
			}

		else console.log (status);
		};
	}; //end of doDistanceMatrix


//*****************************************************
//  FIREBASE RELATED MODULES
//******************************************************


var personAexists = false;
var personBexists = false;
var you = "C";

var data = new Firebase("https://anonymeetut.firebaseio.com/");
var dataPersonA = new Firebase("https://anonymeetut.firebaseio.com/personA");
var dataPersonB = new Firebase("https://anonymeetut.firebaseio.com/personB");
var fbStatus = new Firebase("https://anonymeetut.firebaseio.com/status");

var personA = {
	address: "",
	city: "",
	zip: ""};

var personB = {
	address: "",
	city: "",
	zip: ""};


// Whenever a user clicks the start button
//  ***** will need to incorporate the user input validation 
//  

$("#addressform").on("submit", function() {

	event.preventDefault();

	// Find out if someone else is person A already
	// If not, user is person A 
	if (personAexists == false) {

		//  call user input validation function here

		you = "A";
		personA.address = $('#address').val().trim();
		personA.city = $('#city').val().trim();
		personA.zip = $('#zip').val().trim();
		// Save the user info in firebase.
		dataPersonA.set({
			'address': personA.address,
			'city': personA.city,
			'zip': personA.zip
			});
		}

	// If the other person has input first, you are person B
	// If two people already using, *****hide input form
	//  and user would not be able to submit form
	else if ((personAexists == true) && (personBexists == false)) {

		//  call user input validation function here

		you = "B";
		personB.address = $('#address').val().trim();
		personB.city = $('#city').val().trim();
		personB.zip = $('#zip').val().trim();

		// Save user info in firebase.
		dataPersonB.set({
			'address': personB.address,
			'city': personB.city,
			'zip': personB.zip
			});
		};
	});  //end of submit form event handler


// At the initial load and any change, find out if Person A exists
dataPersonA.on("value", function(snapshot) {
	if (snapshot.exists()) {
		personAexists = true;

		switch(you) {
		case "A":
			if (personBexists) {
				$("#statusDiv").html("");
				personB = snapshot.val();
				console.log (personB);
				fbStatus.set("Start"); //start processing
				}
			if (!personBexists) $("#statusDiv").html("<h2> Waiting for Anonymous! </h2>");
			break;
		case "B":
			$("#statusDiv").html("");
			personA = snapshot.val();
			console.log (personA);

			fbStatus.set("Start"); //start processing
			break;
		case "C":
			if (personBexists) $("#statusDiv").html("<h2>You are a third wheel!</h2>");
			// *** Disable Form
			if (!personBexists) $("#statusDiv").html("<h2> Enter Your Info </h2>");
			break;
		default:
			console.log("error")
			}
		}
	else {
		personAexists = false;
			switch(you) {
			case "B":
				$("#statusDiv").html("<h2> Waiting for Anonymous! </h2>");
				break;
			case "C":
				$("#statusDiv").html("<h2> Enter Your Info </h2>");
				break;
			default:
				console.log("error")
			};
		
		}
	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
	});

// At the initial load and any change, find out if Player 2 exists
dataPersonB.on("value", function(snapshot) {
	if (snapshot.exists()) {
		personBexists = true;
		switch(you) {
		case "B":
			if (personAexists) {
				$("#statusDiv").html(""); 
				personA = snapshot.val();
				console.log (personA);
				fbStatus.set("Start"); //start processing
				};
			if (!personAexists) $("#statusDiv").html("<h2> Waiting for Anonymous! </h2>");
			break;
		case "A":
			$("#statusDiv").html("");
			personB = snapshot.val();
			console.log (personB);
			fbStatus.set("Start"); //start processing
			break;
		case "C":
			if (personAexists) $("#statusDiv").html("<h2>You are a third wheel!</h2>");
			// *** Disable Form

			if (!personAexists) $("#statusDiv").html("<h2> Enter Your Info </h2>");
			break;
		default:
			console.log("error");
			}	
		}
	else {
		personBexists = false;
		switch(you) {
			case "A":
				$("#statusDiv").html("<h2> Waiting for Anonymous! </h2>");
				break;
			case "C":
				$("#statusDiv").html("<h2> Enter Your Info </h2>");
				break;
			default:
				console.log("error");
			};
		
		}		
	}, function (errorObject) {
  		console.log("The read failed: " + errorObject.code);
	});

fbStatus.on("value", function(snapshot) {
	if (snapshot.val()=="Start") console.log("call processing function from here");
	if (snapshot.val()=='stop') console.log("reset everything");
	});
	
$('#tableDiv').on('click','.option',function(){
	$('#name').html($(this).data('name'));
});

});



 // end of document.ready

// ************************ 
//          SPARE PARTS
//  DON'T KNOW IF WE NEED THIS.  DISCARD AT END IF NOT NEEDED
//     JSON stringify and then parse so you can see the lat and long values
//		var placesResult = JSON.stringify(results);
//		yourNearbyLocations = JSON.parse(placesResult); 
//		console.log (yourNearbyLocations);
//		$('#result').append("places: " + placesResult)


// NOT USING THESE LISTENERS, DISCARD IF NOT NEEDED AT ALL
//  KEEPING FOR NOW JUST IN CASE....
//
// listener for user clicking on "show places" button

// $('#show-places').on("click", function(event){
// 	event.preventDefault();
// 	var bounds = new google.maps.LatLngBounds();
// 	// extend the boundaries of the map for each marker
// 	for (var i=0; i < markers.length; i++) {
// 		markers[i].setMap(map);
// 		bounds.extend(markers[i].position);
// 	};
// 	map.fitBounds(bounds);
// });

// listener for user clicking on "hide places" button

// $('#hide-places').on("click", function(event){
// 	event.preventDefault();
// 	for (var i=0; i < markers.length; i++) {
// 		markers[i].setMap(null);
// 	};
// });

