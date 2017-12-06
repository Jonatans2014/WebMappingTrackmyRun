cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
  {
    "id": "cordova-plugin-device-name.DeviceName",
    "file": "plugins/cordova-plugin-device-name/www/device-name.js",
    "pluginId": "cordova-plugin-device-name",
    "clobbers": [
      "cordova.plugins.deviceName"
    ]
  },
  {
    "id": "cordova-plugin-geolocation.geolocation",
    "file": "plugins/cordova-plugin-geolocation/www/android/geolocation.js",
    "pluginId": "cordova-plugin-geolocation",
    "clobbers": [
      "navigator.geolocation"
    ]
  },
  {
    "id": "cordova-plugin-geolocation.PositionError",
    "file": "plugins/cordova-plugin-geolocation/www/PositionError.js",
    "pluginId": "cordova-plugin-geolocation",
    "runs": true
  }
];
module.exports.metadata = 
// TOP OF METADATA
{
  "cordova-plugin-device-name": "1.3.2",
  "cordova-plugin-geolocation": "2.4.3",
  "cordova-plugin-whitelist": "1.3.2"
};
// BOTTOM OF METADATA
});