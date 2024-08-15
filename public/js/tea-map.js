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
        .then(response => response.text())  // Convert to text first
        .then(text => {
            return JSON.parse(text);  // Then parse it as JSON
        })
        .then(products => {
            products.forEach(product => {
                if (product.lat && product.lng) {
                    L.marker([product.lat, product.lng]).addTo(map);
                } else {
                    console.warn(`Product ${product.name} does not have valid coordinates.`);
                }
            });
        })
        .catch(error => console.error('Error fetching products:', error));

});