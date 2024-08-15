// public/js/admin.js

function getUserActivities() {
    axios.get('/admin/activities')
        .then(response => {
            const activities = response.data;
            populateActivityTable(activities);
        })
        .catch(error => console.error('Error fetching activities:', error));
}

function filterUserActivities() {
    const filter = document.getElementById('userFilter').value;
    axios.post('/admin/filter', { prefix: filter })
        .then(response => {
            const activities = response.data;
            populateActivityTable(activities);
        })
        .catch(error => console.error('Error filtering activities:', error));
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
        div.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <img src="${product.imageUrl}" alt="${product.name}" style="max-width: 200px;">
            <p>Price: $${product.price}</p>
            <button onclick="removeProduct('${product.id}')">Remove</button>
        `;
        productList.appendChild(div);
    });
}

function addProduct(event) {
    event.preventDefault();
    const name = document.getElementById('productTitle').value;
    const description = document.getElementById('productDescription').value;
    const imageUrl = document.getElementById('productPicture').value;
    const price = document.getElementById('productPrice').value;

    axios.post('/admin/products', { name, description, imageUrl, price })
        .then(() => {
            getProducts();
            document.getElementById('addProductForm').reset();
        })
        .catch(error => console.error('Error adding product:', error));
}

function removeProduct(productId) {
    axios.delete(`/admin/products/${productId}`)
        .then(() => getProducts())
        .catch(error => console.error('Error removing product:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    getUserActivities();
    getProducts();

    document.getElementById('userFilter').addEventListener('input', filterUserActivities);
    document.getElementById('addProductForm').addEventListener('submit', addProduct);
});