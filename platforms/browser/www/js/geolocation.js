

var track_id = '';      // Name/ID of the exercise
var watch_id = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects
var CountID;

var response;
var i;
var getCoors;



//
// var onMapWatchSuccess = function (position) {
//
//     var updatedLatitude = position.coords.latitude;
//     var updatedLongitude = position.coords.longitude;
//
//     if (updatedLatitude != Latitude && updatedLongitude != Longitude) {
//
//         Latitude = updatedLatitude;
//         Longitude = updatedLongitude;
//
//         getMap(updatedLatitude, updatedLongitude);
//     }
// }



function recordLocation() {


    $("body").on('click','#startTracking_start', function(){
        // onSuccess Callback
        //   This method accepts a `Position` object, which contains
        //   the current GPS coordinates
        //
        var onSuccess = function(position) {
            alert('Latitude: '          + position.coords.latitude          + '\n' +
                'Longitude: '         + position.coords.longitude         + '\n' +
                'Altitude: '          + position.coords.altitude          + '\n' +
                'Accuracy: '          + position.coords.accuracy          + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                'Heading: '           + position.coords.heading           + '\n' +
                'Speed: '             + position.coords.speed             + '\n' +
                'Timestamp: '         + position.timestamp                + '\n');

            tracking_data.push(position);
            console.log(tracking_data);
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
        }

        // Options: throw an error if no update is received every 30 seconds.
        //
        var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 ,  enableHighAccuracy: true });
        // // Start tracking the User
        // watch_id = navigator.geolocation.watchPosition(
        //
        //     // Success
        //     function(position){
        //         tracking_data.push(position);
        //     },
        //
        //     // Error
        //     function(error){
        //         console.log(error);
        //     },
        //
        //     // Settings
        //     { frequency: 3000, enableHighAccuracy: true },
        //     console.log(tracking_data )
        //
        //     );

        // Tidy up the UI
        track_id = $("#track_id").val();


        $("#track_id").hide();

        $("#startTracking_status").html("Tracking workout: <strong>" + track_id + "</strong>");


    });
}


function stopdata()
{
    $("body").on('click','#startTracking_stop', function()
    {
        console.log("inside stop",data);
        // Stop tracking the user
        navigator.geolocation.clearWatch(watch_id);

        // Save the tracking data
        window.localStorage.setItem(track_id, JSON.stringify(tracking_data));

            //console.log(  window.localStorage.setItem(track_id, JSON.stringify(tracking_data)));
            console.log(tracking_data)
        // Reset watch_id and tracking_data
        var watch_id = null;
        var data = null;


        // Tidy up the UI
        $("#track_id").val("").show();

        $("#startTracking_status").html("Stopped tracking workout: <strong>" + track_id + "</strong>");


        var getdata = tracking_data;

    });

}




function populateHistory()
{


    $("body").on("pageshow",'#history', function(event, ui)
   {

       var URL= "http://127.0.0.1:8000/listloc/";
       const xhr = new XMLHttpRequest();
       xhr.onreadystatechange = function () {
           if (xhr.readyState === XMLHttpRequest.DONE) {
               if (xhr.status === 200) {
                   response = JSON.parse(xhr.responseText);

                   console.log(response)

                   // Count the number of entries in localStorage and display this information to the user
                   CountID = response.features.length;

                   $("#tracks_recorded").html("<strong>" + response.features.length + "</strong> workout(s) recorded");

                   // Empty the list of recorded tracks
                   $("#history_tracklist").empty();

                   console.log("here",CountID)
                   for(i =0; i <response.features.length; i ++ )
                   {
                       $("#history_tracklist").append("<li><a href='#track_info' data-ajax='false'>" + response.features[i].properties.TrackID + "</a></li>");
                   }
                   // refresh list
                   $("#history_tracklist").listview('refresh');

               } else {
                   console.log('Error ' + xhr.statusText);
               }
           }
       }
       xhr.open("GET", URL);
       xhr.send();

    });
}


function displayMap() {


    $("body").on('click','#history_tracklist li a', function()
    {

        $("#track_info").attr("track_id", $(this).text());
        console.log("history Track",$("#track_info").attr("track_id", $(this).text()));
    });


    $("body").on("pageshow",'#track_info', function(event, ui){
    // When the user views the Track Info page

        // Find the track_id of the workout they are viewing
        var key = $(this).attr("track_id");
        console.log("this is key ",key)

        // Update the Track Info page header to the track_id
       // $("#track_info div[data-role=header] h1").text(key);

        // Get all the GPS data for the specific workout
        var data = window.localStorage.getItem(key);

        // Turn the stringified GPS data back into a JS object
        data = JSON.parse(data);});


}



function getMyLocationCallBack() {

    navigator.geolocation.getCurrentPosition
    (getAndSendMylocation, onLocationError, { enableHighAccuracy: true });
}

//function to get phone location and send to django
var getAndSendMylocation = function (position) {

    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;
    var Locationof = "JOhn";
    var URL = "http://127.0.0.1:8000/listloc/";
    var obj2= {
        "name": Locationof,
        "point": {
            "type": "Point",
            "coordinates": [
                Latitude,
                Longitude
            ]
        }
    }

    var myJSON = JSON.stringify(obj2);
    console.log("woooork",myJSON);

    //Store Geolocation to Django
    var xhr = new XMLHttpRequest();
    var url = URL;

    xhr.open("POST",url, true);
    xhr.setRequestHeader("Content-type", "application/json");

    xhr.onreadystatechange = function() {
        console.log(xhr.responseText)
    };
    xhr.send(myJSON);
}

function onLocationError(error) {
    console.log('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

var mymap;
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        getPoinLocation();
        recordLocation();
        stopdata();
        populateHistory();
        displayMap();
        navigator.geolocation.getCurrentPosition(getAndSendMylocation, onLocationError,);



    },


};

// retrieve locations from Django Db
function getPoinLocation() {

    var response;
    var URL= "http://127.0.0.1:8000/listloc/";
    const xhr = new XMLHttpRequest();


    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                response = JSON.parse(xhr.responseText);

                makeBasicMap(response.features[0].geometry)
                for(i =0; i <response.features.length; i ++ )
                {
                    console.log(response.features[i].geometry);
                    console.log("this is i",i)

                    //mark locations that I have been.
                    marker = new L.marker([response.features[i].geometry.coordinates[0],response.features[i].geometry.coordinates[1]]).addTo(mymap);

                }
            } else {
                console.log('Error ' + xhr.statusText);
            }
        }
    }
    xhr.open("GET", URL);
    xhr.send();



}

// render a map
function makeBasicMap(getLat) {

    console.log("this isssss",getLat);
    getlatLon = L.latLng(getLat.coordinates[0],getLat.coordinates[1]);
    mymap = L.map('mapid').setView(getlatLon, 5);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {

        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoiam9uYXRhbnMiLCJhIjoiY2o5YTV5bzl1MHk3eTJ3dDRkYnpnY3phaiJ9.e-qfndXuDLnsoYR9mJM9cA'
    }).addTo(mymap);


}
app.initialize();




