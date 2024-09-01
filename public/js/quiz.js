document.addEventListener('DOMContentLoaded', function() {
    const quizForm = document.getElementById('quiz-form');
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const addToCartBtn = document.getElementById('add-to-cart');

    /**
     * Function to find the matching tea based on user preferences
     * @param preferences
     * @param products
     * @returns {*}
     */
    function findMatchingTea(preferences, products) {
        return products.find(tea =>
          ((tea.category === preferences.type) && (tea.caffeine === preferences.caffeine) && (tea.temperature === preferences.temperature))
          || ((tea.category === preferences.type) && (tea.caffeine === preferences.caffeine))
          || ((tea.category === preferences.type) && (tea.temperature === preferences.temperature))
          || ((tea.caffeine === preferences.caffeine) && (tea.temperature === preferences.temperature))
          || (tea.category === preferences.type) || (tea.caffeine === preferences.caffeine) || (tea.temperature === preferences.temperature)
        ) || products[0]; // Default to first tea if no match found
      }

     // Add event listener to quiz form
    quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var preferences = {
            type: document.getElementById('type').value,
            caffeine: document.getElementById('caffeine').value,
            temperature: document.getElementById('temperature').value
        };

        fetch('/store/api/products')
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(products => {
                var recommendedTea = findMatchingTea(preferences, products);
                
                if (!recommendedTea) {
                    throw new Error('No matching tea found');
                }

                document.getElementById('tea-image').src = recommendedTea.imageUrl;
                document.getElementById('tea-name').textContent = recommendedTea.name;
                document.getElementById('tea-description').textContent = recommendedTea.description;
                document.getElementById('tea-price').textContent = `Price: $${recommendedTea.price}`;
                document.getElementById('tea-origin').textContent = `Origin: ${recommendedTea.origin}`;
                document.getElementById('tea-type').textContent = `Type: ${recommendedTea.category}`;
                document.getElementById('tea-caffeine').textContent = `Caffeine: ${recommendedTea.caffeine}`;
                document.getElementById('tea-temperature').textContent = `Temperature: ${recommendedTea.temperature}`;
                document.getElementById('product-id').value = recommendedTea.id;
                modal.style.display = 'block';
            })
            .catch(error => {
                alert('Detailed error: ' + error.message);
            });
    });

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    addToCartBtn.onclick = function() { 
        alert('Tea added to cart!');
    };
});