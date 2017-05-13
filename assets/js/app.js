function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}
// FUNCTION DECLERATIONS.
//getting geo location 
function getLocation() {
    return new Promise(function(resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geoObj = {};
                console.log(position);
                geoObj.lat = position.coords.latitude;
                geoObj.lng = position.coords.longitude;
                resolve(geoObj);
            });
        } else {
            reject("geolocation not supported");
        }
    });
}

function startAddressGeo() {
    $("#startAddress").val("current address");
};

function endAddressGeo() {
    $("#endAddress").val("current address");
};

function addressToGeo(inputAddress) {
    return new Promise(function(resolve, reject) {
        console.log(inputAddress);

        var key = "AIzaSyAuk1rhKmWAY0bAmGK_4ygL6oApCSadGQg";
        var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + inputAddress + "&" + key;

        axios({
                url: queryURL,
                method: "GET"
            })
            .then(function(response) {
                console.log(response);
                var geoObj = {};
                geoObj = response.data.results[0].geometry.location;
                resolve(geoObj);
            })
            .catch(function(error) {
                reject(error);
            });
    })
};




//lyft
var LYFT_CLIENT_ID = "4VUhVhVOSdP8";
var SECRET = "EghRc_w20qL6BntxutRQxDr1MMpB-Y3g";
var LYFT_TOKEN;



function authenticateLyft() {
    return axios({
        url: 'https://api.lyft.com/oauth/token',
        method: 'POST',
        data: {
            grant_type: 'client_credentials',
            scope: 'public'
        },
        headers: {
            "Authorization": "Basic " + btoa(LYFT_CLIENT_ID + ":" + SECRET)
        }
    })
}

function getLyftPrices(geoObj) {
    return axios({
        url: "https://api.lyft.com/v1/cost?start_lat=" + geoObj.start.lat + "&start_lng=" + geoObj.start.lng + "&end_lat=" + geoObj.end.lat + "&end_lng=" + geoObj.end.lng,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + LYFT_TOKEN
        }
    })
}

function convert(value) {
    return Math.floor(value / 60) + ":" + (value % 60 ? value % 60 : '00')
}

function dollar(value) {


    return ((value / 100).toFixed(2));
}









//main logic here.


function getUberTimeEstimate(geoObj) {
     return new Promise(function(resolve, reject) {
        var uber_token = "9msHLJgzyV3QzWOyuTGYu6dysBnyKw7Oo7dMHSBw";
        axios({
                method: 'GET',
                url: "https://api.uber.com/v1.2/estimates/price?start_latitude=" + geoObj.start.lat + "&start_longitude=" + geoObj.start.lng + "&end_latitude=" + geoObj.end.lat + "&end_longitude=" + geoObj.end.lng,
                headers: {
                    Authorization: "Token " + uber_token
                }
            })
            .then(function(response) {
                resolve(response);
                console.log(response);
            })
            .catch(function(error) {
                reject(error);
            });

    })
}


function initMap(geoObj) {
    var bounds = new google.maps.LatLngBounds;

    console.log(geoObj);
    var origin2 = geoObj.start.lat + "," + geoObj.start.lng;
    console.log(origin2);

    var destinationA = geoObj.end.lat + "," + geoObj.end.lng;
    console.log(destinationA);

    var geocoder = new google.maps.Geocoder;

    var service = new google.maps.DistanceMatrixService;

    service.getDistanceMatrix({
            origins: [origin2],
            destinations: [destinationA],
            travelMode: 'TRANSIT',
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false

        },

        function(response, status) {
            if (status !== 'OK') {
                alert('Error was: ' + status);
            } else {
                var originList = response.originAddresses;
                var destinationList = response.destinationAddresses;
                var outputDiv = document.getElementById('output');
                outputDiv.innerHTML = '';
            }

        var directionsDisplay = new google.maps.DirectionsRenderer;
        var directionsService = new google.maps.DirectionsService;
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: {lat: geoObj.start.lat, lng: geoObj.start.lng}
        });
        directionsDisplay.setMap(map);

         calculateAndDisplayRoute(directionsDisplay, directionsService);
        document.getElementById('mode').addEventListener('change', function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        });
      

      function calculateAndDisplayRoute(directionsDisplay, directionsService) {
        var selectedMode = document.getElementById('mode').value;
        directionsService.route({
          origin: {lat: geoObj.start.lat, lng: geoObj.start.lng},  
          destination: {lat: geoObj.end.lat, lng: geoObj.end.lng},  
         travelMode: "TRANSIT"
        }, function(response, status) {
          if (status == 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
        }
                
                var showGeocodedAddressOnMap = function(asDestination) {
                    return function(results, status) {
                        if (status === 'OK') {
                            map.fitBounds(bounds.extend(results[0].geometry.location));
                       } else {
                            alert('Geocode was not successful due to: ' + status);
                        }
                    };
                };

                for (var i = 0; i < originList.length; i++) {
                    var results = response.rows[i].elements;
                    geocoder.geocode({ 'address': originList[i] },
                        showGeocodedAddressOnMap(false));

                    for (var j = 0; j < results.length; j++) {
                        geocoder.geocode({ 'address': destinationList[j] },
                            showGeocodedAddressOnMap(true));

                        outputDiv.innerHTML += 
                       'Fare: ' + results[j].fare.text + '<br>' + 'Duration: ' + results[j].duration.text;
                        console.log(results);
                    }
                }
            
        });

}
window.onload = function() {



    function callback(response, status) {
        console.log(response);
    }
    $("#useGeoStart").click(function(event) {
        event.preventDefault();
        console.log("eyy")
        startAddressGeo();
    })
    $("#useGeoEnd").click(function(event) {
        event.preventDefault();
        endAddressGeo();
    })

    $("#submitAddress").click(function(event) {
        //check errors

        event.preventDefault();
        var startAddress = $("#startAddress").val();
        var endAddress = $("#endAddress").val();
        //check errors here
        authenticateLyft()
            .then(function(response) {
                LYFT_TOKEN = response.data.access_token;
                return handleAllGeolocation(startAddress, endAddress)
            })
            .then(function(resp) {
                //get fare stuff here
                console.log(resp);
                getAllFareData(resp)
            })


    });
}

function getAllFareData(geoData) {

    var fareInfo = {}
    getLyftPrices(geoData)
        .then(function(resp) {
            console.log(resp);
            fareInfo.lyft = resp;
            console.log(fareInfo.lyft.data.cost_estimates[1].estimated_cost_cents_min);
            console.log(fareInfo.lyft.data.cost_estimates[1].estimated_duration_seconds);
            $("#lyft").append("<br>" + "Lyft average cost: $" + dollar(fareInfo.lyft.data.cost_estimates[1].estimated_cost_cents_min)+ " dollars");
            $("#lyft").append("<br>" + "Lyft average duration: " + convert(fareInfo.lyft.data.cost_estimates[1].estimated_duration_seconds)+ " (minutes:seconds)");
            initMap(geoData);
            return getUberTimeEstimate(geoData);
        })
        .then(function(resp) {
            fareInfo.uber = resp;
            console.log(fareInfo.uber.data.prices[1].high_estimate);
            console.log(fareInfo.lyft.data.cost_estimates[1].estimated_duration_seconds);
            $("#uber").append("<br>" + "Uber average cost: $" + (fareInfo.uber.data.prices[1].high_estimate)+ " dollars");
            $("#uber").append("<br>" + "Uber average duration: " + convert(fareInfo.lyft.data.cost_estimates[1].estimated_duration_seconds)+ " (minutes:seconds)");
            initMap(geoData);
            console.log(fareInfo);
        })
        .catch(function(err) {
            console.error(err);
        })



}

function handleAllGeolocation(startAdr, endAdr) {
    var finalGeoObj = {};
    return new Promise(function(resolve, reject) {
        if (startAdr == "current address" && endAdr == "current address") {
            getLocation()
                .then(function(resp) {
                    finalGeoObj.start = resp;
                    finalGeoObj.end = resp;
                })
                .catch(function(err) {
                    reject(err);
                })

        } else if (startAdr == "current address") {
            getLocation()
                .then(function(resp) {
                    finalGeoObj.start = resp;
                    return addressToGeo(endAdr);
                })
                .then(function(resp) {
                    finalGeoObj.end = resp;
                    resolve(finalGeoObj);
                })
                .catch(function(err) {
                    reject(err);
                })
        } else if (endAdr == "current address") {
            getLocation()
                .then(function(resp) {
                    finalGeoObj.end = resp;
                    return addressToGeo(startAdr);
                })
                .then(function(resp) {
                    finalGeoObj.start = resp;
                    resolve(finalGeoObj);
                })
                .catch(function(err) {
                    reject(err);
                })
        }
        else {
            addressToGeo(endAdr)
            .then(function(resp) {
                finalGeoObj.end = resp;
                return addressToGeo(startAdr)
            })
            .then(function(resp) {
                finalGeoObj.start = resp;
                resolve(finalGeoObj);
            })
        }

    })
}



