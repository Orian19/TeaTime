document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.getElementById('newsletterForm');
    const subscriptionMessage = document.getElementById('subscriptionMessage');

    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the form from actually submitting

        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value;

        // Simulate a subscription process
        setTimeout(() => {
            // Display success message
            subscriptionMessage.textContent = `Thank you for subscribing with ${email}! You've been added to our mailing list.`;
            subscriptionMessage.style.display = 'block';
            subscriptionMessage.style.color = 'white';

            // Clear the input field
            emailInput.value = '';

            // Hide the message after 5 seconds
            setTimeout(() => {
                subscriptionMessage.style.display = 'none';
            }, 5000);
        }, 1000); // Simulate a delay for the subscription process
    });
});