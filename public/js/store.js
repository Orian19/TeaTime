document.addEventListener('DOMContentLoaded', function () {
    /**
     * Fetch product details from the server
     * @param productId
     */
    function openProductDetails(productId) {
        fetch(`/store/product/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(product => {
                // Update modal content with product details
                document.getElementById('productName').innerText = product.name;
                document.getElementById('productImage').src = product.imageUrl;
                document.getElementById('productImage').alt = product.name;
                document.getElementById('productDescription').innerText = product.description;
                document.getElementById('productPrice').innerText = product.price.toFixed(2);
                document.getElementById('productQuantity').innerText = product.quantity;
                document.getElementById('productCategory').innerText = product.category;
                document.getElementById('productOrigin').innerText = product.origin;
                document.getElementById('productCaffeine').innerText = product.caffeine;
                document.getElementById('productTemperature').innerText = product.temperature;

                document.getElementById('productId').value = product.id;

                const modal = document.getElementById('productDetailsModal');
                modal.style.display = "block";
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to load product details. Please try again later.');
            });
    }

    /**
     * Close the product details modal
     */
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

    // Close modal when the close button is clicked
    document.querySelector('.modal .close').addEventListener('click', closeProductDetails);

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('productDetailsModal');
        if (event.target === modal) {
            closeProductDetails();
        }
    });
});
