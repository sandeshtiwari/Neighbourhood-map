var map;
var infoWindow;
var bounds;
var locations = [
          {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
          {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
          {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
          {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
          {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
          {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
        ];
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
    	center: {lat: 40.7413549, lng: -73.9980244},
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

 	//adding location markers for all the locations
 	locations.forEach(function(place){
 		self.places.push(new LocationMarker(place));
 	});
 }
 var LocationMarker = function(locData){
 	console.log(locData.location);
  var self = this;
 	this.title = locData.title;
 	this.position = locData.position;
 	var defaultIcon = makeMarkerIcon('0091ff');
 	var highlightedIcon = makeMarkerIcon('FFFF24');
 	this.marker = new google.maps.Marker({
 		position : locData.location,
 		title: locData.title,
    map: map,
 		animation: google.maps.Animation.DROP,
 		icon: defaultIcon
 	});
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


