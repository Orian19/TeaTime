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
                .then(response => {
                    if (!response.ok) {
                        // Handle non-200 responses
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        displayErrorMessage(data.error);
                    } else if (data.redirect) {
                        window.location.href = data.redirect;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    displayErrorMessage('An unexpected error occurred. Please try again later.');
                });
        });
    }

    function displayErrorMessage(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000); // Hide the message after 5 seconds
    }
});
