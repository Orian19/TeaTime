let allActivities = [];

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search form');
    const searchInput = document.getElementById('searchInput');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        filterActivities(searchTerm);
    });

    // Add event listener for real-time filtering
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        filterActivities(searchTerm);
    });

    // Initial load of activities and products
    getUserActivities();
    getProducts();
    document.getElementById('addProductForm').addEventListener('submit', addProduct);
});

function getUserActivities() {
    axios.get('/admin/activities')
        .then(response => {
            allActivities = response.data;
            populateActivityTable(allActivities);
        })
        .catch(error => console.error('Error fetching activities:', error));
}

function filterActivities(searchTerm) {
    // Use GET request as originally intended
    window.location.href = `/admin?search=${encodeURIComponent(searchTerm)}`;
}

function populateActivityTable(activities) {
    const tbody = document.getElementById('activityTableBody');
    tbody.innerHTML = '';
    activities.forEach(activity => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(activity.datetime).toLocaleString()}</td>
            <td>${activity.username}</td>
            <td>${activity.type}</td>
        `;
        tbody.appendChild(tr);
    });
}

function getProducts() {
    axios.get('/admin/products')
        .then(response => {
            const products = response.data;
            populateProductList(products);
        })
        .catch(error => console.error('Error fetching products:', error));
}

function populateProductList(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.innerHTML = `
            <h3>${product.name} (${product.id})</h3>
            <img src="${product.imageUrl}" alt="${product.name}" style="max-width: 100px;">
            <p>${product.description}</p>
            <p>Price: $${product.price.toFixed(2)}</p>
            <p>Category: ${product.category}</p>
            <p>Origin: ${product.origin}</p>
            <p>Location: ${product.lat}, ${product.lng}</p>
            <p>Caffeine: ${product.caffeine}</p>
            <p>Temperature: ${product.temperature}</p>
            <button class="button remove-btn" onclick="removeProduct('${product.id}')">Remove</button>
        `;
        productList.appendChild(div);
    });
}

function addProduct(event) {
    event.preventDefault();
    const product = {
        id: document.getElementById('productId').value,
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        origin: document.getElementById('productOrigin').value,
        lat: parseFloat(document.getElementById('productLat').value),
        lng: parseFloat(document.getElementById('productLng').value),
        caffeine: document.getElementById('productCaffeine').value,
        temperature: document.getElementById('productTemperature').value,
        imageUrl: document.getElementById('productImageUrl').value
    };
    console.log('Sending product:', product);
    axios.post('/admin/products', product)
        .then(() => {
            getProducts();
            document.getElementById('addProductForm').reset();
        })
        .catch(error => console.error('Error adding product:', error));
}

function removeProduct(productId) {
    axios.post(`/admin/products/${productId}`)
        .then(() => getProducts())
        .catch(error => console.error('Error removing product:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    getUserActivities();
    getProducts();
    document.getElementById('userFilter').addEventListener('input', filterUserActivities);
    document.getElementById('addProductForm').addEventListener('submit', addProduct);
});