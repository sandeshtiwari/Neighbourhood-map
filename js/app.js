var map;
var infoWindow;
var bounds;
var locations = [
          {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
          {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
          {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
          {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
          {title: 'Empire state building', location: {lat: 40.748441, lng: -73.985664}},
          {title: 'Trump Tower', location: {lat: 40.762428, lng: -73.973794}}
        ];
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 40.7413549, lng: -73.9980244},
        styles: getStyles(),
        zoom: 13
    });
    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    //biding the ViewModel with the knockout bindings
    ko.applyBindings(new ViewModel());
 }
 var ViewModel = function(){
 	var self = this;
 	this.places = ko.observableArray([]);
  this.searchValue = ko.observable('');
 	//adding location markers for all the locations
 	locations.forEach(function(place){
 		self.places.push(new LocationMarker(place));
 	});

  this.filterLocation = ko.computed(function(){
    var searchWord = self.searchValue().toLowerCase();
    if(!searchWord){
      self.places().forEach(function(place){
        place.displayCheck(true);
      });
    }
    else{
      return ko.utils.arrayFilter(self.places(), function(place){
        var placeTitle = place.title.toLowerCase();
        var check = placeTitle.includes(searchWord);
        place.displayCheck(check);
        return check;
      });
    }
  },self);
 }
 var LocationMarker = function(locData){
  var self = this;
 	this.title = locData.title;
 	this.position = locData.position;
 	var defaultIcon = makeMarkerIcon('0091ff');
 	var highlightedIcon = makeMarkerIcon('FFFF24');
  this.displayCheck = ko.observable(true);
 	this.marker = new google.maps.Marker({
 		position : locData.location,
 		title: locData.title,
    map: map,
 		animation: google.maps.Animation.DROP,
 		icon: defaultIcon
 	});
  var clientID = 'QUP4T0TYAOJXCZXPDJ2CLHZWSAJFNN41YFTFSHHQJJGOWHTG';
  var clientSecret = 'TZGXJWQA3G20CXT0BFL11ZR0SYLJ3YSY30OWUDYAXXOJB031';

  // get JSON request of foursquare data
  var URL = 'https://api.foursquare.com/v2/venues/search?ll=' + locData.location.lat + ',' + locData.location.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + locData.title;

  $.getJSON(URL).done(function(data) {
    //self.street = data.response.venues[0].location.formattedAddress[0] ? data.response.venues[0].location.formattedAddress[0]: 'N/A';
    if(data.response.venues[0].location.formattedAddress[0] !== undefined)
        self.street = data.response.venues[0].location.formattedAddress[0];
    else
        self.street = 'N/A';
    if(data.response.venues[0].location.formattedAddress[1] !== undefined)
      self.city = data.response.venues[0].location.formattedAddress[1];
    else 
      self.city = 'N/A';
    self.phone = data.response.venues[0].contact.formattedPhone ? data.response.venues[0].contact.formattedPhone : 'N/A';
    if (typeof self.phone === 'undefined')
      self.phone = "N/A";
    }).fail(function() {
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
    populateInfoWindow(this, self.street, self.city, self.phone, infoWindow);
  });
  // show item info when selected from list
  this.showInfo = function(location) {
        google.maps.event.trigger(self.marker, 'click');
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){ 
          self.marker.setAnimation(null);
          }, 2150);
  };
  //observable to diplay all the markers with the displayCheck true
  self.filterMarkers = ko.computed(function () {
        if(self.displayCheck() === true) {
            self.marker.setMap(map);
            bounds.extend(self.marker.position);
            map.fitBounds(bounds);
        } else {
            self.marker.setMap(null);
        }
});
 }

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
      }


