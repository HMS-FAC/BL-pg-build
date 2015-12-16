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
      };
      function createMapWithSlipways(slipways) {

          //TODO remove global
           markers = [];
           var mapProp = {
               zoom: 6,
               mapTypeId: google.maps.MapTypeId.ROADMAP
           };

           //TODO remove global
           map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

           utils.setupInitialLocation(map);

           var infowindow = null;

               Object.keys(slipways).forEach(function(key) {
                   var marker = new google.maps.Marker({
                       position: new google.maps.LatLng(Number(slipways[key].latitude), Number(slipways[key].longitude)),
                       __filtervalue: {Suitability: slipways[key].Suitability}
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

               mc = new MarkerClusterer(map, markers);
               mc.setIgnoreHidden(true);

           var input = document.getElementById('pac-input');
           var searchBox = new google.maps.places.SearchBox(input);

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
             });
       }


       utils = {
         fetchRemoteSlipways: function(callback) {

           firebaseSlipwayArray = new Firebase(
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
               localSlipwayObj[slipwayKey] = utils.transformSingleSlipway(remoteSlipways[slipwayKey]);
             }
           }
           return localSlipwayObj;

         },
         transformSingleSlipway: function(slipwayArray) {

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

             '<button onclick="showSlipwayDetails()" type="button">More Info</button>' +
             '</div>';
         }

       };

     utils.fetchRemoteSlipways(function(remoteSlipways){
       var slipways = utils.transformSlipways(remoteSlipways);

       createMapWithSlipways(slipways );

     });
     function showEditSlipwayForm(){
       document.getElementById("slipwayInfo").innerHTML =
       '<button onclick="submitSlipwayDetails()" type="button">Submit Slipway Details</button>' +
       '<div id=info><br><br>'+
         '<h4>'+
         '<b>Name:</b> '                 +'<input type="text" id="Name" value="'             +Name+               '"><br><br>'+
         '</h4>'+
         '<h3>'+
         'Contact Details '                     +'<br>'+
         '</h3>'+
         '<b>Website:</b> '              +'<input type="text" id="Website" value="'          +Website+            '"><br><br>'+
         '<b>Contact Name:</b> '         +'<input type="text" id="PersonName" value="'       +PersonName+         '"><br><br>'+
         '<b>Contact Phone:</b> '        +'<input type="text" id="PhoneNumber" value="'      +PhoneNumber+        '"><br><br>'+
         '<b>Contact Mobile:</b> '       +'<input type="text" id="MobilePhoneNumber" value="'+MobilePhoneNumber+  '"><br><br>'+
         '<b>Email:</b> '                +'<input type="text" id="Email" value="'            +Email+              '"><br><br>'+
         '<h3>'+
         'Slipway Details '                     +'<br>'+
         '</h3>'+
         '<b>Ramp Description:</b> '     +'<input type="text" id="RampDescription" value="'  +RampDescription+    '"><br><br>'+
         '<b>Ramp Type:</b> '            +'<input type="text" id="RampType" value="'         +RampType+           '"><br><br>'+
         '<b>Suitable for:</b> '         +'<select id="Suitability">'+
                                             '<option value="Unknown">Unknown</option>'+
                                             '<option value="Portable Only">Portable Only</option>'+
                                             '<option value="Small trailer can be pushed">Small trailer can be pushed</option>'+
                                             '<option value="Large trailer needs a car">Large trailer needs a car</option>'+
                                          '</select>'+                                                              '><br><br>'+
         '<b>Ramp Length:</b> '          +'<select id="RampLength">'+
                                             '<option value="Unknown">Unknown</option>'+
                                             '<option value="No Ramp">No Ramp</option>'+
                                             '<option value="1/4 tidal">1/4 tidal</option>'+
                                             '<option value="1/2 tidal">1/2 tidal</option>'+
                                             '<option value="3/4 tidal">3/4 tidal</option>'+
                                             '<option value="Whole of tidal range">Whole of tidal range</option>'+
                                             '<option value="1/4 tidal">1/4 tidal</option>'+
                                             '<option value="Non-tidal">Non-tidal</option>'+
                                           '</select>'+                                                              '><br><br>'+
         '<b>Facilities:</b> '           +'<input type="text" id="Facilities" value="'         +Facilities+         '"><br><br>'+
         '<b>Navigational Hazards:</b> ' +'<input type="text" id="NavigationalHazards" value="'+NavigationalHazards+'"><br><br>'+
         '<b>Upper Area Material:</b> '  +'<select id="UpperAreaMaterial">'+
                                             '<option value="Unknown">Unknown</option>'+
                                             '<option value="Sand">Sand</option>'+
                                             '<option value="Shingle">Shingle</option>'+
                                             '<option value="Rock">Rock</option>'+
                                             '<option value="Harbour">Harbour</option>'+
                                             '<option value="Concrete">Concrete</option>'+
                                          '</select>'+                                                               '><br><br>'+
         '<b>Lower Area Material:</b> '  +'<select id="LowerAreaMaterial">'+
                                             '<option value="Unknown">Unknown</option>'+
                                             '<option value="Sand">Sand</option>'+
                                             '<option value="Shingle">Shingle</option>'+
                                             '<option value="Rock">Rock</option>'+
                                             '<option value="Harbour">Harbour</option>'+
                                             '<option value="Concrete">Concrete</option>'+
                                          '</select>'+                                                               '><br><br>'+
         '<b>Charges:</b> '              +'<input type="text" id="Charges" value="'            +Charges+            '"><br><br>'+
       '</div>';
     }

     function showNewSlipwayForm(){
       document.getElementById("slipwayInfo").innerHTML =

       '<form>'+
       '<button onclick="submitNewSlipwayDetails()" type="button">Submit Slipway Details</button>' +
       '<div id=info><br><br>'+
         '<h4>'+
         '<b>Name:</b> '                 +'<input type="text" id="Name"                                           ><br><br>'+
         '</h4>'+
         '<b>Longitude:</b> '            +'<input type="Longitude" id="Longitude">                                 <br><br>'+
         '<b>Latitude:</b> '             +'<input type="Latitude" id="Latitude">                                   <br><br>'+

         '<h3>'+
         'Contact Details '                     +'<br>'+
         '</h3>'+
         '<b>Website:</b> '              +'<input type="text" id="Website"                                          ><br><br>'+
         '<b>Contact Name:</b> '         +'<input type="text" id="PersonName"                                       ><br><br>'+
         '<b>Contact Phone:</b> '        +'<input type="text" id="PhoneNumber"                                      ><br><br>'+
         '<b>Contact Mobile:</b> '       +'<input type="text" id="MobilePhoneNumber"                                ><br><br>'+
         '<b>Email:</b> '                +'<input type="text" id="Email"                                            ><br><br>'+
         '<h3>'+
         'Slipway Details '                     +'<br>'+
         '</h3>'+
         '<b>Ramp Description:</b> '     +'<input type="text" id="RampDescription"                                  ><br><br>'+
         '<b>Ramp Type:</b> '            +'<input type="text" id="RampType"                                         ><br><br>'+
         '<b>Suitable for:</b> '         +'<select id ="Suitability">'+
                                             '<option value="Unknown">Unknown</option>'+
                                             '<option value="Portable Only">Portable Only</option>'+
                                             '<option value="Small trailer can be pushed">Small trailer can be pushed</option>'+
                                             '<option value="Large trailer needs a car">Large trailer needs a car</option>'+
                                          '</select>'+                                                               '><br><br>'+
         '<b>Ramp Length:</b> '          +'<select id="RampLength">'+
                                             '<option value="Unknown">Unknown</option>'+
                                             '<option value="No Ramp">No Ramp</option>'+
                                             '<option value="1/4 tidal">1/4 tidal</option>'+
                                             '<option value="1/2 tidal">1/2 tidal</option>'+
                                             '<option value="3/4 tidal">3/4 tidal</option>'+
                                             '<option value="Whole of tidal range">Whole of tidal range</option>'+
                                             '<option value="1/4 tidal">1/4 tidal</option>'+
                                             '<option value="Non-tidal">Non-tidal</option>'+
                                           '</select>'+                                                              '><br><br>'+
         '<b>Facilities:</b> '           +'<input type="text" id="Facilities" ><br><br>'+
         '<b>Navigational Hazards:</b> ' +'<input type="text" id="NavigationalHazards"                              ><br><br>'+
         '<b>Upper Area Material:</b> '  +'<select id="UpperAreaMaterial">'+
                                             '<option value="Unknown">Unknown</option>'+
                                             '<option value="Sand">Sand</option>'+
                                             '<option value="Shingle">Shingle</option>'+
                                             '<option value="Rock">Rock</option>'+
                                             '<option value="Harbour">Harbour</option>'+
                                             '<option value="Concrete">Concrete</option>'+
                                          '</select>'+                                                               '><br><br>'+
         '<b>Lower Area Material:</b> '  +'<select id="LowerAreaMaterial">'+
                                             '<option value="Unknown">Unknown</option>'+
                                             '<option value="Sand">Sand</option>'+
                                             '<option value="Shingle">Shingle</option>'+
                                             '<option value="Rock">Rock</option>'+
                                             '<option value="Harbour">Harbour</option>'+
                                             '<option value="Concrete">Concrete</option>'+
                                          '</select>'+                                                               '><br><br>'+
         '<b>Charges:</b>'               +'<input type="text" id="Charges"                                          ><br><br>'+
       '</div>'+
       '</form>';
     }

     function showSlipwayDetails() {
        key = document.getElementById("key").innerHTML;
        Name                = "";
        Website             = "";
        PersonName          = "";
        PhoneNumber         = "";
        MobilePhoneNumber   = "";
        Email               = "";
        RampDescription     = "";
        RampType            = "";
        Suitability         = "";
        RampLength          = "";
        Facilities          = "";
        NavigationalHazards = "";
        UpperArea           = "";
        LowerArea           = "";
        Charges             = "";

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

       function submitNewSlipwayDetails(data){
         var idKey = Date.now();
         var keyRoute = new Firebase('https://crackling-inferno-1794.firebaseio.com/'+ idKey);
         var nameInput              = document.getElementById('Name').value,
             longInput              = document.getElementById('Longitude').value,
             latInput               = document.getElementById('Latitude').value,
             websiteInput           = document.getElementById('Website').value,
             personInput            = document.getElementById('PersonName').value,
             phoneNumberInput       = document.getElementById('PhoneNumber').value,
             mobilePhoneInput       = document.getElementById('MobilePhoneNumber').value,
             emailInput             = document.getElementById('Email').value,
             rampDescInput          = document.getElementById('RampDescription').value,
             rampTypeInput          = document.getElementById('RampType').value,
             suitabilityInput       = document.getElementById('Suitability').value, // select
             rampLengthInput        = document.getElementById('RampLength').value, // select
             facilitiesInput        = document.getElementById('Facilities').value,
             navHazInput            = document.getElementById('NavigationalHazards').value,
             upperAreaMaterialInput = document.getElementById('UpperAreaMaterial').value, // select
             lowerAreaMaterialInput = document.getElementById('LowerAreaMaterial').value, //select
             chargesInput           = document.getElementById('Charges').value;

         keyRoute.set([
           idKey,
           nameInput,
           longInput,
           latInput,
                   , // NearestPlace
                   , // Country
                   , // Region
           websiteInput,
           personInput,
           phoneNumberInput,
           mobilePhoneInput,
                   , // Fax
           emailInput,
           rampDescInput,
                   , // Directions
           rampTypeInput,
           upperAreaMaterialInput,
           lowerAreaMaterialInput,
           suitabilityInput,
           rampLengthInput,
           facilitiesInput,
           chargesInput,
                       , // CruisingArea
           navHazInput,
                         // Images
         ]);
       }

       function submitSlipwayDetails(){
         console.log("KEYOBJ-------->>>>>>>>",localSlipwayObj[key].latitude);
         console.log("LONG-------->>>>>>>>",localSlipwayObj[key].longitude);

         var idKey = key;
         var keyRoute = new Firebase('https://crackling-inferno-1794.firebaseio.com/'+ idKey);
         var nameInput              = document.getElementById('Name').value,
             websiteInput           = document.getElementById('Website').value,
             personInput            = document.getElementById('PersonName').value,
             phoneNumberInput       = document.getElementById('PhoneNumber').value,
             mobilePhoneInput       = document.getElementById('MobilePhoneNumber').value,
             emailInput             = document.getElementById('Email').value,
             rampDescInput          = document.getElementById('RampDescription').value,
             rampTypeInput          = document.getElementById('RampType').value,
             suitabilityInput       = document.getElementById('Suitability').value, // select
             rampLengthInput        = document.getElementById('RampLength').value, // select
             facilitiesInput        = document.getElementById('Facilities').value,
             navHazInput            = document.getElementById('NavigationalHazards').value,
             upperAreaMaterialInput = document.getElementById('UpperAreaMaterial').value, // select
             lowerAreaMaterialInput = document.getElementById('LowerAreaMaterial').value, //select
             chargesInput           = document.getElementById('Charges').value;

         keyRoute.set([
           idKey,
           nameInput,
           localSlipwayObj[key].longitude,
           localSlipwayObj[key].latitude,
                   , // NearestPlace
                   , // Country
                   , // Region
           websiteInput,
           personInput,
           phoneNumberInput,
           mobilePhoneInput,
                   , // Fax
           emailInput,
           rampDescInput,
                   , // Directions
           rampTypeInput,
           upperAreaMaterialInput,
           lowerAreaMaterialInput,
           suitabilityInput,
           rampLengthInput,
           facilitiesInput,
           chargesInput,
                       , // CruisingArea
           navHazInput,
                         // Images
         ]);
       }

       $(document).ready(function(){

         $('.dropdown-menu input, .dropdown-menu label').click(function(e) {
               e.stopPropagation();
           });

         $.fn.bootstrapSwitch.defaults.inverse = true;
         $.fn.bootstrapSwitch.defaults.size = 'mini';
         $.fn.bootstrapSwitch.defaults.onColor = 'warning';
         $("[name='unknown-slipways']").bootstrapSwitch();


         $("#submit-filter").click(function(){
           //show unknown slipways too
           if($('#unknown-slipways').is(':checked')) {
             //every slipway
             if($('#portable').is(':checked')) {
               markers.forEach(function(e) {
                   e.setVisible(true);
               });
               mc.repaint();
               }
             // small, large and unknown
             if($('#small').is(':checked')) {
               markers.forEach(function(e) {
                 e.setVisible(true);
                 if(e.__filtervalue.Suitability !== 'Small trailer can be pushed' &&
                   e.__filtervalue.Suitability !== 'Large trailer needs a car' &&
                   e.__filtervalue.Suitability !== 'Unknown'){
                     e.setVisible(false);
                 }
               });
               mc.repaint();
             }
             //large and unknown
             if($('#large').is(':checked')) {
               markers.forEach(function(e) {
                 e.setVisible(true);
                 if(e.__filtervalue.Suitability !== 'Large trailer needs a car' &&
                   e.__filtervalue.Suitability !== 'Unknown'){
                     e.setVisible(false);
                 }
               });
               mc.repaint();
             }
           }
           //doesn't show unknown slipways
           else {
             //every slipway except unknown
             if($('#portable').is(':checked')) {
               markers.forEach(function(e) {
                 e.setVisible(true);
                 if(e.__filtervalue.Suitability === 'Unknown') {
                   e.setVisible(false);
                 }
               });
               mc.repaint();
               }
             //only small and large
             if($('#small').is(':checked')) {
               markers.forEach(function(e) {
                 e.setVisible(true);
                 if(e.__filtervalue.Suitability !== 'Small trailer can be pushed' &&
                   e.__filtervalue.Suitability !== 'Large trailer needs a car'){
                     e.setVisible(false);
                 }
               });
               mc.repaint();
             }
             //only large
             if($('#large').is(':checked')) {
               markers.forEach(function(e) {
                 e.setVisible(true);
                 if(e.__filtervalue.Suitability !== 'Large trailer needs a car') {
                   e.setVisible(false);
                 }
               });
               mc.repaint();
             }
           }

         });
       });



       document.getElementById("slipwayInfo").innerHTML =
       '<button onclick="showEditSlipwayForm()" type="button">Edit Slipway Details</button>' +
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
     }
     function ClusterIcon(cluster,styles){cluster.getMarkerClusterer().extend(ClusterIcon,google.maps.OverlayView),this.cluster_=cluster,this.className_=cluster.getMarkerClusterer().getClusterClass(),this.styles_=styles,this.center_=null,this.div_=null,this.sums_=null,this.visible_=!1,this.setMap(cluster.getMap())}function Cluster(mc){this.markerClusterer_=mc,this.map_=mc.getMap(),this.gridSize_=mc.getGridSize(),this.minClusterSize_=mc.getMinimumClusterSize(),this.averageCenter_=mc.getAverageCenter(),this.hideLabel_=mc.getHideLabel(),this.markers_=[],this.center_=null,this.bounds_=null,this.clusterIcon_=new ClusterIcon(this,mc.getStyles())}function MarkerClusterer(map,opt_markers,opt_options){this.extend(MarkerClusterer,google.maps.OverlayView),opt_markers=opt_markers||[],opt_options=opt_options||{},this.markers_=[],this.clusters_=[],this.listeners_=[],this.activeMap_=null,this.ready_=!1,this.gridSize_=opt_options.gridSize||60,this.minClusterSize_=opt_options.minimumClusterSize||2,this.maxZoom_=opt_options.maxZoom||null,this.styles_=opt_options.styles||[],this.title_=opt_options.title||"",this.zoomOnClick_=!0,void 0!==opt_options.zoomOnClick&&(this.zoomOnClick_=opt_options.zoomOnClick),this.averageCenter_=!1,void 0!==opt_options.averageCenter&&(this.averageCenter_=opt_options.averageCenter),this.ignoreHidden_=!1,void 0!==opt_options.ignoreHidden&&(this.ignoreHidden_=opt_options.ignoreHidden),this.enableRetinaIcons_=!1,void 0!==opt_options.enableRetinaIcons&&(this.enableRetinaIcons_=opt_options.enableRetinaIcons),this.hideLabel_=!1,void 0!==opt_options.hideLabel&&(this.hideLabel_=opt_options.hideLabel),this.imagePath_=opt_options.imagePath||MarkerClusterer.IMAGE_PATH,this.imageExtension_=opt_options.imageExtension||MarkerClusterer.IMAGE_EXTENSION,this.imageSizes_=opt_options.imageSizes||MarkerClusterer.IMAGE_SIZES,this.calculator_=opt_options.calculator||MarkerClusterer.CALCULATOR,this.batchSize_=opt_options.batchSize||MarkerClusterer.BATCH_SIZE,this.batchSizeIE_=opt_options.batchSizeIE||MarkerClusterer.BATCH_SIZE_IE,this.clusterClass_=opt_options.clusterClass||"cluster",-1!==navigator.userAgent.toLowerCase().indexOf("msie")&&(this.batchSize_=this.batchSizeIE_),this.setupStyles_(),this.addMarkers(opt_markers,!0),this.setMap(map)}ClusterIcon.prototype.onAdd=function(){var cMouseDownInCluster,cDraggingMapByCluster,cClusterIcon=this;this.div_=document.createElement("div"),this.div_.className=this.className_,this.visible_&&this.show(),this.getPanes().overlayMouseTarget.appendChild(this.div_),this.boundsChangedListener_=google.maps.event.addListener(this.getMap(),"bounds_changed",function(){cDraggingMapByCluster=cMouseDownInCluster}),google.maps.event.addDomListener(this.div_,"mousedown",function(){cMouseDownInCluster=!0,cDraggingMapByCluster=!1}),google.maps.event.addDomListener(this.div_,"click",function(e){if(cMouseDownInCluster=!1,!cDraggingMapByCluster){var theBounds,mz,mc=cClusterIcon.cluster_.getMarkerClusterer();google.maps.event.trigger(mc,"click",cClusterIcon.cluster_),google.maps.event.trigger(mc,"clusterclick",cClusterIcon.cluster_),mc.getZoomOnClick()&&(mz=mc.getMaxZoom(),theBounds=cClusterIcon.cluster_.getBounds(),mc.getMap().fitBounds(theBounds),setTimeout(function(){mc.getMap().fitBounds(theBounds),null!==mz&&mc.getMap().getZoom()>mz&&mc.getMap().setZoom(mz+1)},100)),e.cancelBubble=!0,e.stopPropagation&&e.stopPropagation()}}),google.maps.event.addDomListener(this.div_,"mouseover",function(){var mc=cClusterIcon.cluster_.getMarkerClusterer();google.maps.event.trigger(mc,"mouseover",cClusterIcon.cluster_)}),google.maps.event.addDomListener(this.div_,"mouseout",function(){var mc=cClusterIcon.cluster_.getMarkerClusterer();google.maps.event.trigger(mc,"mouseout",cClusterIcon.cluster_)})},ClusterIcon.prototype.onRemove=function(){this.div_&&this.div_.parentNode&&(this.hide(),google.maps.event.removeListener(this.boundsChangedListener_),google.maps.event.clearInstanceListeners(this.div_),this.div_.parentNode.removeChild(this.div_),this.div_=null)},ClusterIcon.prototype.draw=function(){if(this.visible_){var pos=this.getPosFromLatLng_(this.center_);this.div_.style.top=pos.y+"px",this.div_.style.left=pos.x+"px"}},ClusterIcon.prototype.hide=function(){this.div_&&(this.div_.style.display="none"),this.visible_=!1},ClusterIcon.prototype.show=function(){if(this.div_){var img="",bp=this.backgroundPosition_.split(" "),spriteH=parseInt(bp[0].trim(),10),spriteV=parseInt(bp[1].trim(),10),pos=this.getPosFromLatLng_(this.center_);this.div_.style.cssText=this.createCss(pos),img="<img src='"+this.url_+"' style='position: absolute; top: "+spriteV+"px; left: "+spriteH+"px; ",img+=this.cluster_.getMarkerClusterer().enableRetinaIcons_?"width: "+this.width_+"px;height: "+this.height_+"px;":"clip: rect("+-1*spriteV+"px, "+(-1*spriteH+this.width_)+"px, "+(-1*spriteV+this.height_)+"px, "+-1*spriteH+"px);",img+="'>",this.div_.innerHTML=img+"<div style='position: absolute;top: "+this.anchorText_[0]+"px;left: "+this.anchorText_[1]+"px;color: "+this.textColor_+";font-size: "+this.textSize_+"px;font-family: "+this.fontFamily_+";font-weight: "+this.fontWeight_+";font-style: "+this.fontStyle_+";text-decoration: "+this.textDecoration_+";text-align: center;width: "+this.width_+"px;line-height:"+this.height_+"px;'>"+(this.cluster_.hideLabel_?" ":this.sums_.text)+"</div>",this.div_.title="undefined"==typeof this.sums_.title||""===this.sums_.title?this.cluster_.getMarkerClusterer().getTitle():this.sums_.title,this.div_.style.display=""}this.visible_=!0},ClusterIcon.prototype.useStyle=function(sums){this.sums_=sums;var index=Math.max(0,sums.index-1);index=Math.min(this.styles_.length-1,index);var style=this.styles_[index];this.url_=style.url,this.height_=style.height,this.width_=style.width,this.anchorText_=style.anchorText||[0,0],this.anchorIcon_=style.anchorIcon||[parseInt(this.height_/2,10),parseInt(this.width_/2,10)],this.textColor_=style.textColor||"black",this.textSize_=style.textSize||11,this.textDecoration_=style.textDecoration||"none",this.fontWeight_=style.fontWeight||"bold",this.fontStyle_=style.fontStyle||"normal",this.fontFamily_=style.fontFamily||"Arial,sans-serif",this.backgroundPosition_=style.backgroundPosition||"0 0"},ClusterIcon.prototype.setCenter=function(center){this.center_=center},ClusterIcon.prototype.createCss=function(pos){var style=[];return style.push("cursor: pointer;"),style.push("position: absolute; top: "+pos.y+"px; left: "+pos.x+"px;"),style.push("width: "+this.width_+"px; height: "+this.height_+"px;"),style.join("")},ClusterIcon.prototype.getPosFromLatLng_=function(latlng){var pos=this.getProjection().fromLatLngToDivPixel(latlng);return pos.x-=this.anchorIcon_[1],pos.y-=this.anchorIcon_[0],pos.x=parseInt(pos.x,10),pos.y=parseInt(pos.y,10),pos},Cluster.prototype.getSize=function(){return this.markers_.length},Cluster.prototype.getMarkers=function(){return this.markers_},Cluster.prototype.getCenter=function(){return this.center_},Cluster.prototype.getMap=function(){return this.map_},Cluster.prototype.getMarkerClusterer=function(){return this.markerClusterer_},Cluster.prototype.getBounds=function(){var i,bounds=new google.maps.LatLngBounds(this.center_,this.center_),markers=this.getMarkers();for(i=0;i<markers.length;i++)bounds.extend(markers[i].getPosition());return bounds},Cluster.prototype.remove=function(){this.clusterIcon_.setMap(null),this.markers_=[],delete this.markers_},Cluster.prototype.addMarker=function(marker){var i,mCount,mz;if(this.isMarkerAlreadyAdded_(marker))return!1;if(this.center_){if(this.averageCenter_){var l=this.markers_.length+1,lat=(this.center_.lat()*(l-1)+marker.getPosition().lat())/l,lng=(this.center_.lng()*(l-1)+marker.getPosition().lng())/l;this.center_=new google.maps.LatLng(lat,lng),this.calculateBounds_()}}else this.center_=marker.getPosition(),this.calculateBounds_();if(marker.isAdded=!0,this.markers_.push(marker),mCount=this.markers_.length,mz=this.markerClusterer_.getMaxZoom(),null!==mz&&this.map_.getZoom()>mz)marker.getMap()!==this.map_&&marker.setMap(this.map_);else if(mCount<this.minClusterSize_)marker.getMap()!==this.map_&&marker.setMap(this.map_);else if(mCount===this.minClusterSize_)for(i=0;mCount>i;i++)this.markers_[i].setMap(null);else marker.setMap(null);return!0},Cluster.prototype.isMarkerInClusterBounds=function(marker){return this.bounds_.contains(marker.getPosition())},Cluster.prototype.calculateBounds_=function(){var bounds=new google.maps.LatLngBounds(this.center_,this.center_);this.bounds_=this.markerClusterer_.getExtendedBounds(bounds)},Cluster.prototype.updateIcon_=function(){var mCount=this.markers_.length,mz=this.markerClusterer_.getMaxZoom();if(null!==mz&&this.map_.getZoom()>mz)return void this.clusterIcon_.hide();if(mCount<this.minClusterSize_)return void this.clusterIcon_.hide();var numStyles=this.markerClusterer_.getStyles().length,sums=this.markerClusterer_.getCalculator()(this.markers_,numStyles);this.clusterIcon_.setCenter(this.center_),this.clusterIcon_.useStyle(sums),this.clusterIcon_.show()},Cluster.prototype.isMarkerAlreadyAdded_=function(marker){for(var i=0,n=this.markers_.length;n>i;i++)if(marker===this.markers_[i])return!0;return!1},MarkerClusterer.prototype.onAdd=function(){var cMarkerClusterer=this;this.activeMap_=this.getMap(),this.ready_=!0,this.repaint(),this.listeners_=[google.maps.event.addListener(this.getMap(),"zoom_changed",function(){cMarkerClusterer.resetViewport_(!1),(this.getZoom()===(this.get("minZoom")||0)||this.getZoom()===this.get("maxZoom"))&&google.maps.event.trigger(this,"idle")}),google.maps.event.addListener(this.getMap(),"idle",function(){cMarkerClusterer.redraw_()})]},MarkerClusterer.prototype.onRemove=function(){var i;for(i=0;i<this.markers_.length;i++)this.markers_[i].getMap()!==this.activeMap_&&this.markers_[i].setMap(this.activeMap_);for(i=0;i<this.clusters_.length;i++)this.clusters_[i].remove();for(this.clusters_=[],i=0;i<this.listeners_.length;i++)google.maps.event.removeListener(this.listeners_[i]);this.listeners_=[],this.activeMap_=null,this.ready_=!1},MarkerClusterer.prototype.draw=function(){},MarkerClusterer.prototype.setupStyles_=function(){var i,size;if(!(this.styles_.length>0))for(i=0;i<this.imageSizes_.length;i++)size=this.imageSizes_[i],this.styles_.push({url:this.imagePath_+(i+1)+"."+this.imageExtension_,height:size,width:size})},MarkerClusterer.prototype.fitMapToMarkers=function(){var i,markers=this.getMarkers(),bounds=new google.maps.LatLngBounds;for(i=0;i<markers.length;i++)bounds.extend(markers[i].getPosition());this.getMap().fitBounds(bounds)},MarkerClusterer.prototype.getGridSize=function(){return this.gridSize_},MarkerClusterer.prototype.setGridSize=function(gridSize){this.gridSize_=gridSize},MarkerClusterer.prototype.getMinimumClusterSize=function(){return this.minClusterSize_},MarkerClusterer.prototype.setMinimumClusterSize=function(minimumClusterSize){this.minClusterSize_=minimumClusterSize},MarkerClusterer.prototype.getMaxZoom=function(){return this.maxZoom_},MarkerClusterer.prototype.setMaxZoom=function(maxZoom){this.maxZoom_=maxZoom},MarkerClusterer.prototype.getStyles=function(){return this.styles_},MarkerClusterer.prototype.setStyles=function(styles){this.styles_=styles},MarkerClusterer.prototype.getTitle=function(){return this.title_},MarkerClusterer.prototype.setTitle=function(title){this.title_=title},MarkerClusterer.prototype.getZoomOnClick=function(){return this.zoomOnClick_},MarkerClusterer.prototype.setZoomOnClick=function(zoomOnClick){this.zoomOnClick_=zoomOnClick},MarkerClusterer.prototype.getAverageCenter=function(){return this.averageCenter_},MarkerClusterer.prototype.setAverageCenter=function(averageCenter){this.averageCenter_=averageCenter},MarkerClusterer.prototype.getIgnoreHidden=function(){return this.ignoreHidden_},MarkerClusterer.prototype.setIgnoreHidden=function(ignoreHidden){this.ignoreHidden_=ignoreHidden},MarkerClusterer.prototype.getEnableRetinaIcons=function(){return this.enableRetinaIcons_},MarkerClusterer.prototype.setEnableRetinaIcons=function(enableRetinaIcons){this.enableRetinaIcons_=enableRetinaIcons},MarkerClusterer.prototype.getImageExtension=function(){return this.imageExtension_},MarkerClusterer.prototype.setImageExtension=function(imageExtension){this.imageExtension_=imageExtension},MarkerClusterer.prototype.getImagePath=function(){return this.imagePath_},MarkerClusterer.prototype.setImagePath=function(imagePath){this.imagePath_=imagePath},MarkerClusterer.prototype.getImageSizes=function(){return this.imageSizes_},MarkerClusterer.prototype.setImageSizes=function(imageSizes){this.imageSizes_=imageSizes},MarkerClusterer.prototype.getCalculator=function(){return this.calculator_},MarkerClusterer.prototype.setCalculator=function(calculator){this.calculator_=calculator},MarkerClusterer.prototype.setHideLabel=function(hideLabel){this.hideLabel_=hideLabel},MarkerClusterer.prototype.getHideLabel=function(){return this.hideLabel_},MarkerClusterer.prototype.getBatchSizeIE=function(){return this.batchSizeIE_},MarkerClusterer.prototype.setBatchSizeIE=function(batchSizeIE){this.batchSizeIE_=batchSizeIE},MarkerClusterer.prototype.getClusterClass=function(){return this.clusterClass_},MarkerClusterer.prototype.setClusterClass=function(clusterClass){this.clusterClass_=clusterClass},MarkerClusterer.prototype.getMarkers=function(){return this.markers_},MarkerClusterer.prototype.getTotalMarkers=function(){return this.markers_.length},MarkerClusterer.prototype.getClusters=function(){return this.clusters_},MarkerClusterer.prototype.getTotalClusters=function(){return this.clusters_.length},MarkerClusterer.prototype.addMarker=function(marker,opt_nodraw){this.pushMarkerTo_(marker),opt_nodraw||this.redraw_()},MarkerClusterer.prototype.addMarkers=function(markers,opt_nodraw){var key;for(key in markers)markers.hasOwnProperty(key)&&this.pushMarkerTo_(markers[key]);opt_nodraw||this.redraw_()},MarkerClusterer.prototype.pushMarkerTo_=function(marker){if(marker.getDraggable()){var cMarkerClusterer=this;google.maps.event.addListener(marker,"dragend",function(){cMarkerClusterer.ready_&&(this.isAdded=!1,cMarkerClusterer.repaint())})}marker.isAdded=!1,this.markers_.push(marker)},MarkerClusterer.prototype.removeMarker=function(marker,opt_nodraw,opt_noMapRemove){var removeFromMap=!0&&!opt_noMapRemove,removed=this.removeMarker_(marker,removeFromMap);return!opt_nodraw&&removed&&this.repaint(),removed},MarkerClusterer.prototype.removeMarkers=function(markers,opt_nodraw,opt_noMapRemove){var i,r,removed=!1,removeFromMap=!0&&!opt_noMapRemove;for(i=0;i<markers.length;i++)r=this.removeMarker_(markers[i],removeFromMap),removed=removed||r;return!opt_nodraw&&removed&&this.repaint(),removed},MarkerClusterer.prototype.removeMarker_=function(marker,removeFromMap){var i,index=-1;if(this.markers_.indexOf)index=this.markers_.indexOf(marker);else for(i=0;i<this.markers_.length;i++)if(marker===this.markers_[i]){index=i;break}return-1===index?!1:(removeFromMap&&marker.setMap(null),this.markers_.splice(index,1),!0)},MarkerClusterer.prototype.clearMarkers=function(){this.resetViewport_(!0),this.markers_=[]},MarkerClusterer.prototype.repaint=function(){var oldClusters=this.clusters_.slice();this.clusters_=[],this.resetViewport_(!1),this.redraw_(),setTimeout(function(){var i;for(i=0;i<oldClusters.length;i++)oldClusters[i].remove()},0)},MarkerClusterer.prototype.getExtendedBounds=function(bounds){var projection=this.getProjection(),tr=new google.maps.LatLng(bounds.getNorthEast().lat(),bounds.getNorthEast().lng()),bl=new google.maps.LatLng(bounds.getSouthWest().lat(),bounds.getSouthWest().lng()),trPix=projection.fromLatLngToDivPixel(tr);trPix.x+=this.gridSize_,trPix.y-=this.gridSize_;var blPix=projection.fromLatLngToDivPixel(bl);blPix.x-=this.gridSize_,blPix.y+=this.gridSize_;var ne=projection.fromDivPixelToLatLng(trPix),sw=projection.fromDivPixelToLatLng(blPix);return bounds.extend(ne),bounds.extend(sw),bounds},MarkerClusterer.prototype.redraw_=function(){this.createClusters_(0)},MarkerClusterer.prototype.resetViewport_=function(opt_hide){var i,marker;for(i=0;i<this.clusters_.length;i++)this.clusters_[i].remove();for(this.clusters_=[],i=0;i<this.markers_.length;i++)marker=this.markers_[i],marker.isAdded=!1,opt_hide&&marker.setMap(null)},MarkerClusterer.prototype.distanceBetweenPoints_=function(p1,p2){var R=6371,dLat=(p2.lat()-p1.lat())*Math.PI/180,dLon=(p2.lng()-p1.lng())*Math.PI/180,a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(p1.lat()*Math.PI/180)*Math.cos(p2.lat()*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2),c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)),d=R*c;return d},MarkerClusterer.prototype.isMarkerInBounds_=function(marker,bounds){return bounds.contains(marker.getPosition())},MarkerClusterer.prototype.addToClosestCluster_=function(marker){var i,d,cluster,center,distance=4e4,clusterToAddTo=null;for(i=0;i<this.clusters_.length;i++)cluster=this.clusters_[i],center=cluster.getCenter(),center&&(d=this.distanceBetweenPoints_(center,marker.getPosition()),distance>d&&(distance=d,clusterToAddTo=cluster));clusterToAddTo&&clusterToAddTo.isMarkerInClusterBounds(marker)?clusterToAddTo.addMarker(marker):(cluster=new Cluster(this),cluster.addMarker(marker),this.clusters_.push(cluster))},MarkerClusterer.prototype.createClusters_=function(iFirst){var i,marker,mapBounds,cMarkerClusterer=this;if(this.ready_){0===iFirst&&(google.maps.event.trigger(this,"clusteringbegin",this),"undefined"!=typeof this.timerRefStatic&&(clearTimeout(this.timerRefStatic),delete this.timerRefStatic)),mapBounds=this.getMap().getZoom()>3?new google.maps.LatLngBounds(this.getMap().getBounds().getSouthWest(),this.getMap().getBounds().getNorthEast()):new google.maps.LatLngBounds(new google.maps.LatLng(85.02070771743472,-178.48388434375),new google.maps.LatLng(-85.08136444384544,178.00048865625));var bounds=this.getExtendedBounds(mapBounds),iLast=Math.min(iFirst+this.batchSize_,this.markers_.length);for(i=iFirst;iLast>i;i++)marker=this.markers_[i],!marker.isAdded&&this.isMarkerInBounds_(marker,bounds)&&(!this.ignoreHidden_||this.ignoreHidden_&&marker.getVisible())&&this.addToClosestCluster_(marker);if(iLast<this.markers_.length)this.timerRefStatic=setTimeout(function(){cMarkerClusterer.createClusters_(iLast)},0);else for(delete this.timerRefStatic,google.maps.event.trigger(this,"clusteringend",this),i=0;i<this.clusters_.length;i++)this.clusters_[i].updateIcon_()}},MarkerClusterer.prototype.extend=function(obj1,obj2){return function(object){var property;for(property in object.prototype)this.prototype[property]=object.prototype[property];return this}.apply(obj1,[obj2])},MarkerClusterer.CALCULATOR=function(markers,numStyles){for(var index=0,title="",count=markers.length.toString(),dv=count;0!==dv;)dv=parseInt(dv/10,10),index++;return index=Math.min(index,numStyles),{text:count,index:index,title:title}},MarkerClusterer.BATCH_SIZE=2e3,MarkerClusterer.BATCH_SIZE_IE=500,MarkerClusterer.IMAGE_PATH="//cdn.rawgit.com/mahnunchik/markerclustererplus/master/images/m",MarkerClusterer.IMAGE_EXTENSION="png",MarkerClusterer.IMAGE_SIZES=[53,56,66,78,90],"function"!=typeof String.prototype.trim&&(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")});

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
