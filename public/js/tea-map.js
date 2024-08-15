console.log("tea-map.js is loaded");

document.addEventListener('DOMContentLoaded', function() {
    const map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // // Create a marker cluster group
    // const markers = L.markerClusterGroup();

    fetch('/store/api/tea-regions')
        .then(response => response.json())
        .then(regions => {
            regions.forEach(region => {
                if (region.lat && region.lng) {
                    const marker = L.marker([region.lat, region.lng]).addTo(map);

                    // Add a link in the popup that redirects to the store page with a query parameter for filtering by origin
                    marker.bindPopup(`
                    <b>${region.name}</b><br>
                    <a href="/store?origin=${encodeURIComponent(region.name)}">
                        View products from ${region.name}
                    </a>
                `);
                }
            });
        })
        .catch(error => console.error('Error fetching products:', error));


});