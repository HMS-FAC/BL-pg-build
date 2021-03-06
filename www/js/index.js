/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        navigator.splashscreen.hide();
        app.receivedEvent('deviceready');
        window.onerror = function(err) {
          document.getElementById('myerror').innerHTML = err.toString();
      }
      function createMapWithSlipways(slipways) {

           var markers = [];
           var mapProp = {
               zoom: 6,
               mapTypeId: google.maps.MapTypeId.ROADMAP
           };

           var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

           utils.setupInitialLocation(map);

           var infowindow = null;

               Object.keys(slipways).forEach(function(key) {
                   var marker = new google.maps.Marker({
                       position: new google.maps.LatLng(Number(slipways[key].latitude), Number(slipways[key].longitude))
                   });
                   markers.push(marker);
                   marker.setMap(map);
                   marker.addListener('click', function() {
                     if (infowindow) {
                       infowindow.close();
                     }

                     infowindow = new google.maps.InfoWindow({
                       content : utils.renderInfoContent(slipways, key)
                     });

                     infowindow.open(map, marker);

                   });

               });
               var mc = new MarkerClusterer(map, markers);

           var input = document.getElementById('pac-input');
           var searchBox = new google.maps.places.SearchBox(input);
           map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

           map.addListener('bounds_changed', function() {
               searchBox.setBounds(map.getBounds());
           });

           searchBox.addListener('places_changed', function() {
               console.log("places_changed");
               var places = searchBox.getPlaces();

               if (places.length === 0) {
                   return;
               }

               markers.forEach(function(marker) {
                   marker.setMap(null);
               });
               markers = [];

               //  https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete
               map.setCenter(places[0].geometry.location);

               var bounds = new google.maps.LatLngBounds();
               places.forEach(function(place) {
                   var icon = {
                       url: place.icon,
                       size: new google.maps.Size(71, 71),
                       origin: new google.maps.Point(0, 0),
                       anchor: new google.maps.Point(17, 34),
                       scaledSize: new google.maps.Size(25, 25)
                   };

                   markers.push(new google.maps.Marker({
                       map: map,
                       icon: icon,
                       title: place.name,
                       position: place.geometry.location
                   }));
               });
               //map.fitBounds(bounds);
             });
       }


      utils = {
        fetchRemoteSlipways: function(callback) {

          var firebaseSlipwayArray = new Firebase(
            'https://crackling-inferno-1794.firebaseio.com/'
          );
          firebaseSlipwayArray.on('value', function(snapshot) {
            return callback(snapshot.val());
          });

        },
        transformSlipways: function(remoteSlipways) {
          localSlipwayObj = {};
          var slipwayKey;
          for (slipwayKey in remoteSlipways) {
            if (remoteSlipways.hasOwnProperty(slipwayKey)) {
              localSlipwayObj[slipwayKey] = utils.transformSlipway(remoteSlipways[slipwayKey]);
            }
          }
          return localSlipwayObj;
        },
        transformSlipway: function(slipwayArray) {
          if (typeof slipwayArray[2] === 'number') {
            slipwayArray[2] = slipwayArray[2].toString();
          }

          if (typeof slipwayArray[3] === 'number') {
            slipwayArray[3] = slipwayArray[3].toString();
          }

          return {
            idKey:                slipwayArray[0] || Math.random().toString(),
            Name:                 slipwayArray[1],
            'longitude':          slipwayArray[2],
            'latitude':           slipwayArray[3],
            'NearestPlace':       slipwayArray[4],
            'Country':            slipwayArray[5],
            'Region':             slipwayArray[6],
            'Website':            slipwayArray[7],
            'PersonName':         slipwayArray[8],
            'PhoneNumber':        slipwayArray[9],
            'MobilePhoneNumber':  slipwayArray[10],
            'FaxNumber':          slipwayArray[11],
            'Email':              slipwayArray[12],
            'RampDescription':    slipwayArray[13],
            'Directions':         slipwayArray[14],
            'RampType':           slipwayArray[15],
            'UpperArea':          slipwayArray[16],
            'LowerArea':          slipwayArray[17],
            'Suitability':        slipwayArray[18],
            'RampLength':         slipwayArray[19],
            'Facilities':         slipwayArray[20],
            'Charges':            slipwayArray[21],
            'CruisingArea':       slipwayArray[22],
            'NavigationalHazards':slipwayArray[23],
            'images':             slipwayArray[24]
          };
        },
        showSlipwayDetails: function(DbObj) {
           key = document.getElementById("key").innerHTML;
           Name                = "Unknown";
           Website             = "Unknown";
           PersonName          = "Unknown";
           PhoneNumber         = "Unknown";
           MobilePhoneNumber   = "Unknown";
           Email               = "Unknown";
           RampDescription     = "Unknown";
           RampType            = "Unknown";
           Suitability         = "Unknown";
           RampLength          = "Unknown";
           Facilities          = "Unknown";
           NavigationalHazards = "Unknown";
           UpperArea           = "Unknown";
           LowerArea           = "Unknown";
           Charges             = "Unknown";

          if (typeof localSlipwayObj[key].Name !== "undefined"){
            Name = localSlipwayObj[key].Name;
          }
          if (typeof localSlipwayObj[key].Website !== "undefined"){
            Website = localSlipwayObj[key].Website;
          }
          if (typeof localSlipwayObj[key].PersonName !== "undefined"){
            PersonName = localSlipwayObj[key].PersonName;
          }
          if (typeof localSlipwayObj[key].PhoneNumber !== "undefined"){
            PhoneNumber = localSlipwayObj[key].PhoneNumber;
          }
          if (typeof localSlipwayObj[key].MobilePhoneNumber !== "undefined"){
            MobilePhoneNumber = localSlipwayObj[key].MobilePhoneNumber;
          }
          if (typeof localSlipwayObj[key].Email !== "undefined"){
            Email = localSlipwayObj[key].Email;
          }
          if (typeof localSlipwayObj[key].RampDescription !== "undefined"){
            RampDescription = localSlipwayObj[key].RampDescription;
          }
          if (typeof localSlipwayObj[key].RampType !== "undefined"){
            RampType = localSlipwayObj[key].RampType;
          }
          if (typeof localSlipwayObj[key].Suitability !== "undefined"){
            Suitability = localSlipwayObj[key].Suitability;
          }
          if (typeof localSlipwayObj[key].RampLength !== "undefined"){
            RampLength = localSlipwayObj[key].RampLength;
          }
          if (typeof localSlipwayObj[key].Facilities !== "undefined"){
            Facilities = localSlipwayObj[key].Facilities;
          }
          if (typeof localSlipwayObj[key].NavigationalHazards !== "undefined"){
            NavigationalHazards = localSlipwayObj[key].NavigationalHazards;
          }
          if (typeof localSlipwayObj[key].UpperArea !== "undefined"){
            UpperArea = localSlipwayObj[key].UpperArea;
          }
          if (typeof localSlipwayObj[key].LowerArea !== "undefined"){
            LowerArea = localSlipwayObj[key].LowerArea;
          }
          if (typeof localSlipwayObj[key].Charges !== "undefined"){
            Charges = localSlipwayObj[key].Charges;
          }

      //console.log("localSlipWayObj----->>>>>",localSlipwayObj);
          document.getElementById("slipwayInfo").innerHTML =
          '<button onclick="utils.editSlipwayDetails()" type="button">Edit Slipway Details</button>' +
          '<div id=info><br><br>'+
            '<h2>'+
                                              Name                +'<br>'+
            '</h2>'+
            '<h3>'+
            'Contact Details '                                    +'<br>'+
            '</h3>'+
            '<b>Website:</b> '              + Website             +'<br><br>'+
            '<b>Contact Name:</b> '         + PersonName          +'<br><br>'+
            '<b>Contact Phone:</b> '        + PhoneNumber         +'<br><br>'+
            '<b>Contact Mobile:</b> '       + MobilePhoneNumber   +'<br><br>'+
            '<b>Email:</b> '                + Email               +'<br><br>'+
            '<h3>'+
            'Slipway Details '                                    +'<br>'+
            '</h3>'+
            '<b>Ramp Description:</b> '     + RampDescription     +'<br><br>'+
            '<b>Ramp Type:</b> '            + RampType            +'<br><br>'+
            '<b>Suitable for:</b> '         + Suitability         +'<br><br>'+
            '<b>Ramp Length:</b> '          + RampLength          +'<br><br>'+
            '<b>Facilities:</b> '           + Facilities          +'<br><br>'+
            '<b>Navigational Hazards:</b> ' + NavigationalHazards +'<br><br>'+
            '<b>Upper Area Material:</b> '  + UpperArea           +'<br><br>'+
            '<b>Lower Area Material:</b> '  + LowerArea           +'<br><br>'+
            '<b>Charges:</b> '              + Charges             +'<br><br>'+

          '</div>';
        },
        editSlipwayDetails: function(){
          document.getElementById("slipwayInfo").innerHTML =
          '<button onclick="utils.submitSlipwayDetails()" type="button">Submit Slipway Details</button>' +
          '<div id=info><br><br>'+
            '<h4>'+
            '<b>Name:</b> '                 +'<input type="text" name="Name" value='             +Name+               '><br><br>'+
            '</h4>'+
            '<b>Longitude:</b> '            +'<input type="Longitude" name="Longitude">                                 <br><br>'+
            '<b>Latitude:</b> '             +'<input type="Latitude" name="Latitude">                                   <br><br>'+

            '<h3>'+
            'Contact Details '                     +'<br>'+
            '</h3>'+
            '<b>Website:</b> '              +'<input type="text" name="Website" value='          +Website+            '><br><br>'+
            '<b>Contact Name:</b> '         +'<input type="text" name="PersonName" value='       +PersonName+         '><br><br>'+
            '<b>Contact Phone:</b> '        +'<input type="text" name="PhoneNumber" value='      +PhoneNumber+        '><br><br>'+
            '<b>Contact Mobile:</b> '       +'<input type="text" name="MobilePhoneNumber" value='+MobilePhoneNumber+  '><br><br>'+
            '<b>Email:</b> '                +'<input type="text" name="Email" value='            +Email+              '><br><br>'+
            '<h3>'+
            'Slipway Details '                     +'<br>'+
            '</h3>'+
            '<b>Ramp Description:</b> '     +'<input type="text" name="RampDescription" value='  +RampDescription+    '><br><br>'+
            '<b>Ramp Type:</b> '            +'<input type="text" name="RampType" value='         +RampType+           '><br><br>'+
            '<b>Suitable for:</b> '         +'<select>'+
                                                '<option value="Unknown">Unknown</option>'+
                                                '<option value="Portable Only">Portable Only</option>'+
                                                '<option value="Small trailer can be pushed">Small trailer can be pushed</option>'+
                                                '<option value="Large trailer needs a car">Large trailer needs a car</option>'+
                                             '</select>'+                                                              '><br><br>'+
            '<b>Ramp Length:</b> '          +'<select>'+
                                                '<option value="Unknown">Unknown</option>'+
                                                '<option value="No Ramp">No Ramp</option>'+
                                                '<option value="1/4 tidal">1/4 tidal</option>'+
                                                '<option value="1/2 tidal">1/2 tidal</option>'+
                                                '<option value="3/4 tidal">3/4 tidal</option>'+
                                                '<option value="Whole of tidal range">Whole of tidal range</option>'+
                                                '<option value="1/4 tidal">1/4 tidal</option>'+
                                                '<option value="Non-tidal">Non-tidal</option>'+
                                              '</select>'+                                                              '><br><br>'+
            '<b>Facilities:</b> '           +'<input type="text" name="Facilities" value='         +Facilities+         '><br><br>'+
            '<b>Navigational Hazards:</b> ' +'<input type="text" name="NavigationalHazards" value='+NavigationalHazards+'><br><br>'+
            '<b>Upper Area Material:</b> '  +'<select>'+
                                                '<option value="Unknown">Unknown</option>'+
                                                '<option value="Sand">Sand</option>'+
                                                '<option value="Shingle">Shingle</option>'+
                                                '<option value="Rock">Rock</option>'+
                                                '<option value="Harbour">Harbour</option>'+
                                                '<option value="Concrete">Concrete</option>'+
                                             '</select>'+                                                               '><br><br>'+
            '<b>Lower Area Material:</b> '  +'<select>'+
                                                '<option value="Unknown">Unknown</option>'+
                                                '<option value="Sand">Sand</option>'+
                                                '<option value="Shingle">Shingle</option>'+
                                                '<option value="Rock">Rock</option>'+
                                                '<option value="Harbour">Harbour</option>'+
                                                '<option value="Concrete">Concrete</option>'+
                                             '</select>'+                                                               '><br><br>'+
            '<b>Charges:</b> '              +'<input type="text" name="Charges" value='            +Charges+            '><br><br>'+
          '</div>';
        },addNewSlipway: function(){
          document.getElementById("slipwayInfo").innerHTML =
          '<button onclick="utils.submitSlipwayDetails()" type="button">Submit Slipway Details</button>' +
          '<div id=info><br><br>'+
            '<h4>'+
            '<b>Name:</b> '                 +'<input type="text" name="Name"                                           ><br><br>'+
            '</h4>'+
            '<b>Longitude:</b> '            +'<input type="Longitude" name="Longitude">                                 <br><br>'+
            '<b>Latitude:</b> '             +'<input type="Latitude" name="Latitude">                                   <br><br>'+

            '<h3>'+
            'Contact Details '                     +'<br>'+
            '</h3>'+
            '<b>Website:</b> '              +'<input type="text" name="Website"                                          ><br><br>'+
            '<b>Contact Name:</b> '         +'<input type="text" name="PersonName"                                       ><br><br>'+
            '<b>Contact Phone:</b> '        +'<input type="text" name="PhoneNumber"                                      ><br><br>'+
            '<b>Contact Mobile:</b> '       +'<input type="text" name="MobilePhoneNumber"                                ><br><br>'+
            '<b>Email:</b> '                +'<input type="text" name="Email"                                            ><br><br>'+
            '<h3>'+
            'Slipway Details '                     +'<br>'+
            '</h3>'+
            '<b>Ramp Description:</b> '     +'<input type="text" name="RampDescription"                                  ><br><br>'+
            '<b>Ramp Type:</b> '            +'<input type="text" name="RampType"                                         ><br><br>'+
            '<b>Suitable for:</b> '         +'<select>'+
                                                '<option value="Unknown">Unknown</option>'+
                                                '<option value="Portable Only">Portable Only</option>'+
                                                '<option value="Small trailer can be pushed">Small trailer can be pushed</option>'+
                                                '<option value="Large trailer needs a car">Large trailer needs a car</option>'+
                                             '</select>'+                                                               '><br><br>'+
            '<b>Ramp Length:</b> '          +'<select>'+
                                                '<option value="Unknown">Unknown</option>'+
                                                '<option value="No Ramp">No Ramp</option>'+
                                                '<option value="1/4 tidal">1/4 tidal</option>'+
                                                '<option value="1/2 tidal">1/2 tidal</option>'+
                                                '<option value="3/4 tidal">3/4 tidal</option>'+
                                                '<option value="Whole of tidal range">Whole of tidal range</option>'+
                                                '<option value="1/4 tidal">1/4 tidal</option>'+
                                                '<option value="Non-tidal">Non-tidal</option>'+
                                              '</select>'+                                                              '><br><br>'+
            '<b>Facilities:</b> '           +'<input type="text" name="Facilities" ><br><br>'+
            '<b>Navigational Hazards:</b> ' +'<input type="text" name="NavigationalHazards"                              ><br><br>'+
            '<b>Upper Area Material:</b> '  +'<select>'+
                                                '<option value="Unknown">Unknown</option>'+
                                                '<option value="Sand">Sand</option>'+
                                                '<option value="Shingle">Shingle</option>'+
                                                '<option value="Rock">Rock</option>'+
                                                '<option value="Harbour">Harbour</option>'+
                                                '<option value="Concrete">Concrete</option>'+
                                             '</select>'+                                                               '><br><br>'+
            '<b>Lower Area Material:</b> '  +'<select>'+
                                                '<option value="Unknown">Unknown</option>'+
                                                '<option value="Sand">Sand</option>'+
                                                '<option value="Shingle">Shingle</option>'+
                                                '<option value="Rock">Rock</option>'+
                                                '<option value="Harbour">Harbour</option>'+
                                                '<option value="Concrete">Concrete</option>'+
                                             '</select>'+                                                               '><br><br>'+
            '<b>Charges:</b> '              +'<input type="text" name="Charges"                                          ><br><br>'+
          '</div>';
        },
        setupInitialLocation: function(map) {
          if (navigator.geolocation) {
            browserSupportFlag = true;
            navigator.geolocation.getCurrentPosition(function(position) {
              initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              map.setCenter(initialLocation);
            }, function() {
              initialLocation = new google.maps.LatLng(51.508742, -0.120850);
            });
          } else {
            initialLocation = new google.maps.LatLng(51.508742, -0.120850);
          }
        },

        renderInfoContent: function(data, key) {

          return '<div id="name">' +
            '<h3>' + data[key].Name + '</h3>' +
            '</div>' +
            '<p hidden id="key">'+key+'</p hidden>'+

            '<button onclick="utils.showSlipwayDetails()" type="button">More Info</button>' +
            '</div>';
        }

      };

      utils.fetchRemoteSlipways(function(remoteSlipways){
        var slipways = utils.transformSlipways(remoteSlipways);

        createMapWithSlipways(slipways);

      });

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
