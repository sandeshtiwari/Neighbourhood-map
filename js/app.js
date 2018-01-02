// global variables
var map;
var infoWindow;
var bounds;
// locations to be displayed on the map
var locations = [
          {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
          {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
          {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
          {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
          {title: 'Empire state building', location: {lat: 40.748441, lng: -73.985664}},
          {title: 'Trump Tower', location: {lat: 40.762428, lng: -73.973794}}
        ];
// initial function to initialize the map and apply the knockout bindings
function initMap() {
  // creating a new map in a particular location
	map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 40.7413549, lng: -73.9980244},
      styles: getStyles(),
      zoom: 13
    });
    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    //binding the ViewModel with the knockout bindings
    ko.applyBindings(new ViewModel());
 }
// ViewModel for the map to control the data and the view
var ViewModel = function(){
 	var self = this;
  // observable array for places
 	this.places = ko.observableArray([]);
  // observable for the search value
  this.searchValue = ko.observable('');
 	//adding location markers for all the locations
 	locations.forEach(function(place){
 		self.places.push(new LocationMarker(place));
 	});
  // filtering location based on the text input form the user
  this.filterLocation = ko.computed(function(){
    var searchWord = self.searchValue().toLowerCase();
    // if nothing is typed by the user
    if(!searchWord){
      self.places().forEach(function(place){
        // setting the display to true for all the location
        place.displayCheck(true);
      });
    }
    // if something is typed by the user then filter the places observable array
    else{
      return ko.utils.arrayFilter(self.places(), function(place){
          var placeTitle = place.title.toLowerCase();
          var check = placeTitle.includes(searchWord);
          // setting the display to true or false based on the input
          place.displayCheck(check);
          return check;
      });
    }
    return self.places();
  },self);
}
// location marker for a given location data
var LocationMarker = function(locData){
  var self = this;
 	this.title = locData.title;
 	this.position = locData.position;
  // creating marker icons with a given color
 	var defaultIcon = makeMarkerIcon('0091ff');
 	var highlightedIcon = makeMarkerIcon('FFFF24');
  // setting the displayCheck to true initially to display the marker
  this.displayCheck = ko.observable(true);
  // creating the marker
 	this.marker = new google.maps.Marker({
 		position : locData.location,
 		title: locData.title,
    map: map,
 		animation: google.maps.Animation.DROP,
 		icon: defaultIcon
 	});
  // clientID and clientSecret for Foursquare API
  var clientID = 'QUP4T0TYAOJXCZXPDJ2CLHZWSAJFNN41YFTFSHHQJJGOWHTG';
  var clientSecret = 'TZGXJWQA3G20CXT0BFL11ZR0SYLJ3YSY30OWUDYAXXOJB031';

  // get JSON request of foursquare data
  var URL = 'https://api.foursquare.com/v2/venues/search?ll=' + locData.location.lat + ',' + locData.location.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + locData.title;
  // JSON request for Foursquare API
  $.getJSON(URL).done(function(data) {
    //checking for undefined street address
    if(data.response.venues[0].location.formattedAddress[0] !== undefined)
        self.street = data.response.venues[0].location.formattedAddress[0];
    else
        self.street = 'N/A';
    // checking for undefined city
    if(data.response.venues[0].location.formattedAddress[1] !== undefined)
      self.city = data.response.venues[0].location.formattedAddress[1];
    else 
      self.city = 'N/A';
    self.phone = data.response.venues[0].contact.formattedPhone ? data.response.venues[0].contact.formattedPhone : 'N/A';
    if (typeof self.phone === 'undefined')
      self.phone = "N/A";
  }).fail(function() {
    // error message if something went wrong with Foursquare 
    alert('Error with Foursquare. Please try again');
  });
  // Two event listeners - one for mouseover, one for mouseout,
  // to change the colors back and forth.
  this.marker.addListener('mouseover', function() {
    this.setIcon(highlightedIcon);
  });
  this.marker.addListener('mouseout', function() {
    this.setIcon(defaultIcon);
  });
  this.marker.addListener('click', function() {
    // poupulated the infow window for a marker
    populateInfoWindow(this, self.street, self.city, self.phone, infoWindow);
    // bounce the marker if it is clicked
    bounceMarker();
  });
  // show item info when selected from list
  this.showInfo = function() {
    // trigger the marker if it is selected from the list
    google.maps.event.trigger(self.marker, 'click');
    // bounce marker
    bounceMarker();
  };
  // observable to display all the markers with the displayCheck true
  self.filterMarkers = ko.computed(function () {
    if(self.displayCheck() === true) {
        self.marker.setMap(map);
        bounds.extend(self.marker.position);
        map.fitBounds(bounds);
    } else {
        self.marker.setMap(null);
    }
  });
  // bouce the marker for a certain time
  var bounceMarker = function(){
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ 
      self.marker.setAnimation(null);
    }, 2150);
  }
}
// function to populated the infowindow passed for the given marker
function populateInfoWindow(marker, street, city, phone, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;

    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
    });
    var content = '<h4>' + marker.title + '</h4>' + 
        '<p>' + street + "<br>" + city + '<br>' + phone + "</p>";
    infowindow.setContent(content);
    // Open the infowindow.
    infowindow.open(map, marker);  
  }       
}
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
    return markerImage;
}
// function to return the styles array for styling the map
function getStyles(){
  return styles = [
    {
      featureType: 'water',
      stylers: [
        { color: '#19a0d8' }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        { color: '#ffffff' },
        { weight: 6 }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -40 }
      ]
    },{
      featureType: 'transit.station',
      stylers: [
        { weight: 9 },
        { hue: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' }
      ]
    },{
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [
        { lightness: 100 }
      ]
    },{
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        { lightness: -100 }
      ]
    },{
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [
        { visibility: 'on' },
        { color: '#f0e4d3' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -25 }
      ]
    }
  ];
}// function to display the erro message if Google Maps has an error
function error(){
  alert("Error occured with Google Maps. Please try again.")
}