document.addEventListener('DOMContentLoaded', function () {
    // Open product details modal
    function openProductDetails(productId) {
        fetch(`/store/product/${productId}`)
            .then(response => response.json())
            .then(product => {
                // Update modal content with product details
                document.getElementById('productName').innerText = product.name;
                document.getElementById('productImage').src = product.imageUrl;
                document.getElementById('productImage').alt = product.name;
                document.getElementById('productDescription').innerText = product.description;
                document.getElementById('productPrice').innerText = product.price.toFixed(2);
                document.getElementById('productCategory').innerText = product.category;
                document.getElementById('productOrigin').innerText = product.origin;
                document.getElementById('productCaffeine').innerText = product.caffeine;
                document.getElementById('productTemperature').innerText = product.temperature;
                // document.getElementById('productBrewingTime').innerText = product.brewingTime;

                // Set the product ID in the form for adding to cart
                document.getElementById('productId').value = product.id;

                const modal = document.getElementById('productDetailsModal');
                modal.style.display = "block";
            })
            .catch(error => console.error('Error fetching product details:', error));
    }

    function closeProductDetails() {
        const modal = document.getElementById('productDetailsModal');
        modal.style.display = "none";
    }

    // Attach event listeners to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function (event) {
            const targetElement = event.target;

            // Prevent modal opening when clicking on the quantity input or Add to Cart button
            if (
                targetElement.closest('.quantity-input') ||
                targetElement.closest('button')
            ) {
                return;
            }

            const productId = card.dataset.productId;
            openProductDetails(productId);
        });
    });

    document.querySelector('.modal .close').addEventListener('click', closeProductDetails);
});
