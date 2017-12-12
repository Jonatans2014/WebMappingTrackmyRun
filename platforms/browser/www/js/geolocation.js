


var track_id = '';      // Name/ID of the exercise
var watch_id = null;    // ID of the geolocation
var tracking_data = []; // Array containing GPS position objects
var CountID;

var response;
var i;
var getCoors;



// Called when capture operation is finished
//
function captureSuccess(mediaFiles) {
    var i, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        uploadFile(mediaFiles[i]);

        alert(mediaFiles[i]);
    }
}

// Called if something bad happens.
//
function captureError(error) {
    var msg = 'An error occurred during capture: ' + error.code;
    navigator.notification.alert(msg, null, 'Uh oh!');
}

// A button will call this function
//
function captureImage() {
    // Launch device camera application,
    // allowing user to capture up to 2 images
    navigator.device.capture.captureImage(captureSuccess, captureError, {limit: 2});
}




// Upload files to server
function uploadFile(mediaFile) {
    var ft = new FileTransfer(),
        path = mediaFile.fullPath,
        name = mediaFile.name;


    console.log(mediaFile);

    ft.upload(path,
        "http://my.domain.com/upload.php",
        function(result) {
            console.log('Upload success: ' + result.responseCode);
            console.log(result.bytesSent + ' bytes sent');
        },
        function(error) {
            console.log('Error uploading file ' + path + ': ' + error.code);
        },
        { fileName: name });
}

function recordLocation() {



    $("body").on('click','#startTracking_start', function(){

        // Tidy up the UI
        track_id = $("#track_id").val();


        $("#track_id").hide();

        $("#startTracking_status").html("Tracking workout: <strong>" + track_id + "</strong>");


    });



    $("body").on("pageshow",'#startTracking', function(event, ui) {

        // onSuccess Callback
        //   This method accepts a `Position` object, which contains
        //   the current GPS coordinates
        //
        var onSuccess = function(position) {
            // alert('Latitude: '          + position.coords.latitude          + '\n' +
            //     'Longitude: '         + position.coords.longitude         + '\n' +
            //     'Altitude: '          + position.coords.altitude          + '\n' +
            //     'Accuracy: '          + position.coords.accuracy          + '\n' +
            //     'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
            //     'Heading: '           + position.coords.heading           + '\n' +
            //     'Speed: '             + position.coords.speed             + '\n' +
            //     'Timestamp: '         + position.timestamp                + '\n');

            tracking_data.push(position.coords.latitude,position.coords.longitude);
            console.log("this is tracking",tracking_data);
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


    });



}





function stopdata()
{
    $("body").on('click','#startTracking_stop', function()
    {

        // Stop tracking the user
        navigator.geolocation.clearWatch(watch_id);

        // Save the tracking data
        window.localStorage.setItem(track_id, JSON.stringify(tracking_data));

            //console.log(  window.localStorage.setItem(track_id, JSON.stringify(tracking_data)));
        console.log("this is other tracking ",tracking_data)
        // Reset watch_id and tracking_data
        var watch_id = null;






        console.log("this is data",tracking_data)
        var URL = "http://127.0.0.1:8000/listloc/";
        var obj2= {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    tracking_data,
                    tracking_data
                ]

            },
            "properties": {
                "TrackID": track_id
            }
        };


        //alert(obj2)
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


        // Tidy up the UI
        $("#track_id").val("").show();

        $("#startTracking_status").html("Stopped tracking workout: <strong>" + track_id + "</strong>");
    });

}



function gps_distance(lat1, lon1, lat2, lon2)
{
    // http://www.movable-type.co.uk/scripts/latlong.html
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
        // getPoinLocation();
        recordLocation();
        stopdata();
        populateHistory();

        navigator.geolocation.getCurrentPosition(getAndSendMylocation, onLocationError,);




    },


};



window.onload = function () {

    // noinspection JSAnnotator
    var seconds = 00;
    // noinspection JSAnnotator
    var tens = 00;
    var min= 0;

    var appendTens = document.getElementById("tens")
    var appendSeconds = document.getElementById("seconds")
    var appendMin = document.getElementById("minutes")
    var buttonStart = document.getElementById('startTracking_start');
    var buttonStop = document.getElementById('startTracking_stop');
    var buttonReset = document.getElementById('button-reset');
    var Interval ;

    buttonStart.onclick = function() {

        clearInterval(Interval);
        Interval = setInterval(startTimer, 10);
    }

    buttonStop.onclick = function() {
        clearInterval(Interval);

        var gettens;
        var getsecond;

        tens = "00";
        seconds = "00";



        console.log("this is value", gettens);
        appendTens.innerHTML = tens;
        appendSeconds.innerHTML = seconds;
    }


    buttonReset.onclick = function() {
        clearInterval(Interval);
        tens = "00";
        seconds = "00";
        appendTens.innerHTML = tens;
        appendSeconds.innerHTML = seconds;
    }



    function startTimer () {
        tens++;
        if(tens < 9){
            appendTens.innerHTML = "0" + tens;
        }

        if (tens > 9){
            appendTens.innerHTML = tens;



        }

        if (tens > 99) {
            console.log("seconds");

            seconds++;
            appendSeconds.innerHTML = "0" + seconds;
            tens = 0;
            appendTens.innerHTML = "0" + 0;
        }

        if (seconds > 9){
            appendSeconds.innerHTML = seconds;
        }

        if(seconds >59)
        {

            min++;
            appendMin.innerHTML = min

            seconds = 0;
        }

    }


}


app.initialize();




