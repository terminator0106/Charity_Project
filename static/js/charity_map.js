let map;
let previouslyClickedMarker = null;
let defaultZoom = 10;
let zoomedInLevel = 16;

function initMap() {
  // Check if charityData exists and has items
  if (typeof charityData === 'undefined' || charityData.length === 0) {
    console.error("No charity data available for the map");
    // Center on India as a fallback
    const defaultLocation = { lat: 20.5937, lng: 78.9629 };
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 5,
      center: defaultLocation,
    });
    return;
  }

  // Calculate the center based on the first charity or use a default
  const firstCharity = charityData[0];
  const mapCenter = {
    lat: parseFloat(firstCharity.latitude) || 19.0760,
    lng: parseFloat(firstCharity.longitude) || 72.8777
  };
  
  // Initialize the map with default zoom level
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: defaultZoom,
    center: mapCenter,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true
  });

  // Add markers for each charity
  charityData.forEach(function(charity) {
    const position = {
      lat: parseFloat(charity.latitude),
      lng: parseFloat(charity.longitude)
    };
    
    const marker = new google.maps.Marker({
      position: position,
      map: map,
      title: charity.name,
      animation: google.maps.Animation.DROP
    });

    // Capitalize first letter of charity name
    const capitalizedName = charity.name.charAt(0).toUpperCase() + charity.name.slice(1);

    // Create info window with only name and location
    const infoContent = `
      <div class="info-window">
        <h3 style="color: #2AB7CA;">${capitalizedName}</h3>
        <p>${charity.location}</p>
      </div>
    `;
    
    const infowindow = new google.maps.InfoWindow({
      content: infoContent,
      maxWidth: 180
    });

    // Add click listener with toggle zoom functionality
    marker.addListener("click", function() {
      // If this is the same marker that was clicked before
      if (previouslyClickedMarker === marker && map.getZoom() > defaultZoom) {
        // Same marker clicked twice - zoom out
        map.setZoom(defaultZoom);
        // Keep the marker in view
        map.panTo(marker.getPosition());
      } else {
        // New marker or zoomed out - zoom in
        map.setCenter(marker.getPosition());
        map.setZoom(zoomedInLevel);
      }
      
      // Update the previously clicked marker
      previouslyClickedMarker = marker;
      
      // Always open the info window
      infowindow.open(map, marker);
    });
  });
}
