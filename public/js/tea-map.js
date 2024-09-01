console.log("tea-map.js is loaded");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    initMap();
});

function initMap() {
    console.log("Initializing map");
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error("Map element not found");
        return;
    }

    const map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    fetch('/store/api/tea-regions')
        .then(function(response) {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(function(regions) {
            if (!Array.isArray(regions)) {
                throw new Error("Invalid data format: Expected an array of regions.");
            }

            regions.forEach(function(region) {
                if (region.lat && region.lng) {
                    const marker = L.marker([region.lat, region.lng]).addTo(map);

                    // Create popup content
                    const popupContent = document.createElement('div');
                    popupContent.innerHTML = '<b>' + region.name + '</b><br>';

                    const link = document.createElement('a');
                    link.href = '/store?origin=' + encodeURIComponent(region.name);
                    link.textContent = 'View products from ' + region.name;
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.location.href = this.href;
                    });

                    popupContent.appendChild(link);

                    // Bind popup with custom content
                    marker.bindPopup(popupContent);

                    // Add click event listener to marker
                    marker.on('click', function() {
                        this.openPopup();
                    });
                } else {
                    console.warn(`Invalid region data: ${JSON.stringify(region)}`);
                }
            });
        })
        .catch(function(error) {
            console.error('Error fetching tea regions:', error);
            alert('Failed to load tea regions. Please try again later.');
        });
}
