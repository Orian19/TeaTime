let allActivities = [];
let allProducts = [];
let currentPage = 1;
const productsPerPage = 10;

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search form');
    const searchInput = document.getElementById('searchInput');
    const productSearchInput = document.getElementById('productSearchInput');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        filterActivities(searchTerm);
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        filterActivities(searchTerm);
    });

    productSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        filterProducts(searchTerm);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search') || '';
    if (searchTerm) {
        searchInput.value = searchTerm;
        getFilteredActivities(searchTerm);
    } else {
        getUserActivities();
    }

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

function getFilteredActivities(searchTerm) {
    axios.get(`/admin/filtered-activities?search=${encodeURIComponent(searchTerm)}`)
        .then(response => {
            allActivities = response.data;
            populateActivityTable(allActivities);
        })
        .catch(error => console.error('Error fetching filtered activities:', error));
}

function filterActivities(searchTerm) {
    if (searchTerm) {
        getFilteredActivities(searchTerm);
    } else {
        getUserActivities();
    }
    updateURL(searchTerm);
}

function updateURL(searchTerm) {
    const url = new URL(window.location);
    if (searchTerm) {
        url.searchParams.set('search', searchTerm);
    } else {
        url.searchParams.delete('search');
    }
    window.history.pushState({}, '', url);
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

function getProducts(page = 1, searchTerm = '') {
    axios.get(`/admin/products?page=${page}&search=${encodeURIComponent(searchTerm)}`)
        .then(response => {
            allProducts = response.data.products;
            const totalPages = response.data.totalPages;
            populateProductList(allProducts);
            updatePagination(totalPages, page);
        })
        .catch(error => console.error('Error fetching products:', error));
}

function filterProducts(searchTerm) {
    currentPage = 1;
    getProducts(currentPage, searchTerm);
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

function updatePagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('productPagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.classList.add('pagination-button');
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => getProducts(i, document.getElementById('productSearchInput').value.trim()));
        paginationContainer.appendChild(button);
    }
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
            getProducts(currentPage, document.getElementById('productSearchInput').value.trim());
            document.getElementById('addProductForm').reset();
        })
        .catch(error => console.error('Error adding product:', error));
}

function removeProduct(productId) {
    axios.post(`/admin/products/${productId}`)
        .then(() => getProducts(currentPage, document.getElementById('productSearchInput').value.trim()))
        .catch(error => console.error('Error removing product:', error));
}
