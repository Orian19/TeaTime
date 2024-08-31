document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.querySelector('form[action="/store/checkout/process"]');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            fetch(this.action, {
                method: 'POST',
                body: new FormData(this),
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        const errorElement = document.getElementById('error-message');
                        errorElement.textContent = data.error;
                        errorElement.style.display = 'block';
                        setTimeout(() => {
                            errorElement.style.display = 'none';
                        }, 5000); // Hide the message after 5 seconds
                    } else if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    }
});
