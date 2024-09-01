document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    const subscriptionMessage = document.getElementById('subscriptionMessage');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (!validateEmail(email)) {
                displayErrorMessage('Please enter a valid email address.');
                return;
            }

            // Simulate an asynchronous operation
            setTimeout(() => {
                subscriptionMessage.textContent = `Thank you for subscribing with ${email}! You've been added to our mailing list.`;
                subscriptionMessage.style.display = 'block';
                subscriptionMessage.style.color = 'white';
                emailInput.value = '';
                setTimeout(() => {
                    subscriptionMessage.style.display = 'none';
                }, 5000);
            }, 1000);
        });
    }

    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const mobileNavLinks = document.querySelector('.nav-links-mobile');

    if (hamburger && mobileNavLinks) {
        hamburger.addEventListener('click', function() {
            mobileNavLinks.classList.toggle('open');
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function displayErrorMessage(message) {
        subscriptionMessage.textContent = message;
        subscriptionMessage.style.display = 'block';
        subscriptionMessage.style.color = 'red';
        setTimeout(() => {
            subscriptionMessage.style.display = 'none';
        }, 5000);
    }
});
