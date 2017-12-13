


var track_id = '';      // Name/ID of the exercise
var watch_id = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects
var CountID;

var response;
var i;
var getCoors;

var URL = "http://jonatans.pythonanywhere.com/listloc/";

var path;
var map;
var latlngs = [53.28429039553018, -6.375512123140652];
var i;
var marker1;
var marker2;
var markersLayer = L.layerGroup();
var tracks_info = document.querySelector('#track_info_info')
var total_km;




//algorithm to calculate the lat and long distancem, this algorittm is from  http://www.movable-type.co.uk/scripts/latlong.html
function gps_distance(lat1, lon1, lat2, lon2)
{

    var R = 6371; // km
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
}



function displayMap(getLatLongId) {


    var getCoors
    var time, dist;

    //Display list of tracking
    $("body").on('click','#history_tracklist li a', function()
    {
        markersLayer.clearLayers();
        latlngs = [];

        $("#track_info").attr("track_id", $(this).text());
        console.log("history Track",$("#track_info").attr("track_id", $(this).text()));
    });



    $("body").on("pageshow",'#track_info', function(event, ui) {
        markersLayer.clearLayers();
        latlngs = [];

        console.log("hey",getLatLongId.features[0].properties.time)

        // Find the track_id of the workout they are viewing
        var key = $(this).attr("track_id");

        console.log("this is key ", getLatLongId)

        // Update the Track Info page header to the track_id
        $("#track_info div[data-role=header] h1").text(key);



        // assign object coordinates to var
        for (var i = 0; i < getLatLongId.features.length; i++) {
            if (getLatLongId.features[i].properties.TrackID === key) {
                getCoors = getLatLongId.features[i].geometry.coordinates


                //get the time and distance
                time  = getLatLongId.features[i].properties.time;
                dist = getLatLongId.features[i].properties.distance;
                //display time and distance
                tracks_info.innerHTML = "Time:"+time + "   " +"Travelled Distance " + dist   ;
            }


        }




        // Turn the stringified GPS data back into a JS object


        //push coordinates to lalngs
        for ( i = 0; i < getCoors.length; i++) {
            latlngs.push(new L.LatLng(getCoors[i][0], getCoors[i][1]));
        }




        //display map
        RenderMap('map',latlngs);

        //create markers
        path = L.polyline(latlngs);
        marker1 = L.marker(latlngs[0]);
        marker2 = L.marker(latlngs[i - 1]);
        markersLayer= L.layerGroup([marker1, marker2,path]).addTo(map);
        path.snakeIn();

    });

}



function RenderMap(getMapId,fitbound)
{

    //display map
    if(map === null || map === undefined)
    {


        map = L.map(getMapId);

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {

            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'pk.eyJ1Ijoiam9uYXRhbnMiLCJhIjoiY2o5YTV5bzl1MHk3eTJ3dDRkYnpnY3phaiJ9.e-qfndXuDLnsoYR9mJM9cA'
        }).addTo(map);


    }


    console.log("LatLong inside renderMap",latlngs);
    map.fitBounds(L.latLngBounds(fitbound));

}

function recordLocation() {

    // noinspection JSAnnotator
    var seconds = 00;
    // noinspection JSAnnotator
    var milliseconds = 00;
    var minutes = 0;

    var getmilliseconds = document.getElementById("milliseconds")
    var getSeconds = document.getElementById("seconds")
    var getMinutes = document.getElementById("minutes")
    var Interval;


    function startTimer() {
        milliseconds++;
        if (milliseconds < 9) {
            getmilliseconds.innerHTML = "0" + milliseconds;
        }

        if (milliseconds > 9) {
            getmilliseconds.innerHTML = milliseconds;


        }

        if (milliseconds > 99) {
            console.log("seconds");

            seconds++;
            getSeconds.innerHTML = "0" + seconds;
            milliseconds = 0;
            getmilliseconds.innerHTML = "0" + 0;
        }


        if (seconds > 59) {

            minutes++;
            getMinutes.innerHTML = minutes

            seconds = 0;
        }

    }


    $("body").on('click', '#startTracking_start', function () {

        // Tidy up the UI
        track_id = $("#track_id").val();


        $("#track_id").hide();

        //append track id
        $("#startTracking_status").html("Tracking workout: <strong>" + track_id + "</strong>");


        clearInterval(Interval);
        Interval = setInterval(startTimer, 10);


    });

    //start tracking a get positions
    $("body").on("pageshow", '#startTracking', function (event, ui) {

        // onSuccess Callback
        //   This method accepts a `Position` object, which contains
        //   the current GPS coordinates
        //
        var onSuccess = function (position) {


            tracking_data.push(position.coords.latitude, position.coords.longitude);
            console.log("this is tracking", tracking_data);

        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }

        // Options: throw an error if no update is received every 30 seconds.
        //
        var watchID = navigator.geolocation.watchPosition(onSuccess, onError, {
            timeout: 30000,
            enableHighAccuracy: true
        });


    });

    //stop tracking
    $("body").on('click', '#startTracking_stop', function () {



        console.log("this is value", minutes);
        console.log("this is value", seconds);

        // Stop tracking the user
        navigator.geolocation.clearWatch(watch_id);

        //console.log(window.localStorage.setItem(track_id, JSON.stringify(tracking_data)));
        console.log("this is other tracking ", tracking_data)
        // Reset watch_id and tracking_data
        var watch_id = null;

        var dist = "0";


        if(tracking_data[0][0], tracking_data[0][1], tracking_data[tracking_data.length - 1][0], tracking_data[tracking_data.length - 1][1]=== undefined)
        {
            dist = "NoDist"
        }
        else
        {
            dist = gps_distance(tracking_data[0][0], tracking_data[0][1], tracking_data[tracking_data.length - 1][0], tracking_data[tracking_data.length - 1][1])
        }



        var obj2 = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    tracking_data,
                    tracking_data
                ]

            },
            "properties": {
                "TrackID": track_id,
                "distance": dist,
                "time": minutes +":"+ seconds
            }
        };

        // send data to server

        var myJSON = JSON.stringify(obj2);
        console.log("woooork", myJSON);

        //Store Geolocation to Django
        var xhr = new XMLHttpRequest();
        var url = URL;

        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json");

        xhr.onreadystatechange = function () {
            console.log(xhr.responseText)
        };
        xhr.send(myJSON);


        // Tidy up the UI
        $("#track_id").val("").show();

        $("#startTracking_status").html("Stopped tracking workout: <strong>" + track_id + "</strong>");



        clearInterval(Interval);

        milliseconds = "00";
        seconds = "00";


        getmilliseconds.innerHTML = milliseconds;
        getSeconds.innerHTML = seconds;

    });


}



function populateHistory()
{


    $("body").on("pageshow",'#history', function(event, ui)
   {
        //display list of tracking
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

                       console.log("all coors2", getCoors);
                       $("#history_tracklist").append("<li><a href='#track_info' data-ajax='false'>" + response.features[i].properties.TrackID + "</a></li>");
                   }
                   // refresh list
                   $("#history_tracklist").listview('refresh');


                   //displayMap
                   displayMap(response);
               } else {
                   console.log('Error ' + xhr.statusText);
               }
           }
       }
       xhr.open("GET", URL);
       xhr.send();

    });
}






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
        // getPoinLocation();
        recordLocation();
        populateHistory();



    },
};




app.initialize();




