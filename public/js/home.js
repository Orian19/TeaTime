document.addEventListener('DOMContentLoaded', function() {
    var addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var product = this.getAttribute('data-product');
            alert('Added ' + product + ' to cart!');
        });
    });
});