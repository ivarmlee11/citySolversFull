var pos,
    map,
    markers = [],
    allowMarkerDrop = true,
    allowControlCreationOnMapReload = true,
    formSubmitted = true;


function initMap() {

  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -47.397, lng: 122.644},
    zoom: 11
  });
  console.log('-----')
  getProblems(map);
  console.log('-----')
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));
      
    }, function() {
    });
  };

  var centerControlDiv = document.createElement('div');
  if (formSubmitted) {
    var centerControl = new CenterControl(centerControlDiv, map, 'Drop A Pin and Click Here');
  } else {
    var centerControl = new CenterControl(centerControlDiv, map, 'Issue Submitted. Submit another.');
    formSubmitted = true;
  };
  centerControlDiv.index = 1;
  map.controls.pop();
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
  formSubmitted = false;

  google.maps.event.addListener(map, 'click', function(e) {
    if(allowMarkerDrop) {
      var position = setLatLng(e);
      markers = [position];
      addMarker(markers[0], map);
      var geocoder = new google.maps.Geocoder;
      geocoder.geocode({'location': markers[0]}, function(results, status) {
        if (status === 'OK') {
          if (results[1]) {
            $('#location').val(results[1].formatted_address);
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });
    };
  });
};

$.cloudinary.config({
  cloud_name: 'dzcy6ewty',
  api_key: 566988178887742
});

function getProblems(map) {
  var problemsArray = [];
  $.ajax({
    url: '/problems',
    method: 'GET',
    success: function(data) {
      console.log('get problem list');
      problemsArray = data;
      console.log(problemsArray.length);
      problemsArray.forEach(function(problem) {
        var contentString = '<div><strong>' + problem.title + '</strong></div>' + 
        '<div>' + problem.description + '</div>';

        if(problem.picture !== '') {
          contentString += 
          '<div><img src="http://res.cloudinary.com/dzcy6ewty/image/upload/w_350,c_scale/' + 
          problem.picture + '"/></div>';
        };

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });

        var marker = new google.maps.Marker({
          position: {
            lat: problem.lat,
            lng: problem.lng
          },
          map: map
        });

        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });

      });
    }
  });
};

function setLatLng(event) {
  var position = new Object();
  position['lat'] = event.latLng.lat();
  position['lng'] = event.latLng.lng();
  return position;
};

function addMarker(location, map) {
  allowMarkerDrop = false;
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
};

function CenterControl(controlDiv, map, text) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = text;
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', function() {
    if(allowMarkerDrop === false) {
      $('#myModalHorizontal').modal('show');
    };
  });
};

$(function() {

  var publicId;
  $('#form').append($.cloudinary.unsigned_upload_tag("zg51wn0o", 
    { cloud_name: 'dzcy6ewty' }))
    .bind('cloudinarydone', function(e, data) {
      console.log(data.result);
      publicId = data.result.path;
      $('.cloudinary_fileupload').hide();
    $('.thumbnails').append($.cloudinary.image(data.result.public_id, 
      { format: 'jpg',
        width: 150,
        height: 100, 
        crop: 'thumb',
        effect: 'saturation:50'
      } 
    ))
  });

  $('#submitFormButton').on('click', function(e) {
    e.preventDefault();
    var dataObj = new Object();
    dataObj['lat'] = markers[0].lat;
    dataObj['lng'] = markers[0].lng;
    dataObj['problemTitle'] = $('#problemTitle').val();
    dataObj['description'] = $('#description').val();
    dataObj['location'] = $('#location').val();
    dataObj['type_id'] = $('#problemType').val();
    dataObj['picture'] = (publicId || null);
    $.ajax({
      url: '/problems',
      method: 'POST',
      data: dataObj,
      success: function(data) {
        console.log('data sent');
      }
    });
    $('#myModalHorizontal').modal('hide');
    $('.thumbnails').html('');
    $('.cloudinary_fileupload').show();
    allowControlCreationOnMapReload = !allowControlCreationOnMapReload;
    allowMarkerDrop = !allowMarkerDrop;
    initMap();
  });
});