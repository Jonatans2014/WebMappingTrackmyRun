


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
        //navigator.geolocation.getCurrentPosition(getAndSendMylocation, onLocationError,);

    },

};

// retrieve locations from Django Db
function getPoinLocation() {

    var response;
    var URL= "http://127.0.0.1:8000/snippets/";
    const xhr = new XMLHttpRequest();


    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                response = JSON.parse(xhr.responseText);

                console.log("getting",response);

                /*
                makeBasicMap(response.features[0].geometry)
                for(i =0; i <response.features.length; i ++ )
                {
                    console.log(response.features[i].geometry);
                    console.log("this is i",i)

                    //mark locations that I have been.
                    marker = new L.marker([response.features[i].geometry.coordinates[0],response.features[i].geometry.coordinates[1]]).addTo(mymap);

                }*/
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




