let blendChart;
let blendableTeas = {};

document.addEventListener('DOMContentLoaded', function() {
    const blendForm = document.getElementById('blendForm');
    const flavorInputs = document.querySelectorAll('#flavorComponents input[type="range"]');
    const ctx = document.getElementById('blendChart').getContext('2d');

    // Fetch blendable teas data
    fetch('/store/blendable-teas')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(teas => {
            blendableTeas = teas.reduce((acc, tea) => {
                acc[tea.id] = tea;
                return acc;
            }, {});
        })
        .catch(error => {
            console.error('Error fetching blendable teas:', error);
            alert('Failed to load blendable teas. Please try again later.');
        });

    /**
     * Update the pie chart with the current blend data
     */
    function updateChart() {
        const data = [];
        const labels = [];
        flavorInputs.forEach(input => {
            if (parseInt(input.value) > 0) {
                data.push(parseInt(input.value));
                labels.push(blendableTeas[input.id].name);
            }
        });

        if (blendChart) {
            blendChart.destroy();
        }

        blendChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(201, 203, 207, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    flavorInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.nextElementSibling.textContent = `${e.target.value}%`;
            updateChart();
        });
    });

    blendForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const blendName = document.getElementById('blendName').value;
        const baseTea = document.getElementById('baseTea').value;
        const flavors = {};

        flavorInputs.forEach(input => {
            if (parseInt(input.value) > 0) {
                flavors[input.id] = parseInt(input.value);
            }
        });

        const blendData = {
            name: blendName,
            baseTea: baseTea,
            flavors: flavors
        };

        try {
            const response = await fetch('/store/tea-blender', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blendData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create blend');
            }

            const newBlend = await response.json();
            console.log('New blend created:', newBlend);
            fetchAndDisplayUserBlends();
        } catch (error) {
            console.error('Error creating blend:', error);
            alert(`Failed to create blend: ${error.message}`);
        }
    });

    updateChart(); // Initialize empty chart
    fetchAndDisplayUserBlends();
});

/**
 * Create a pie chart for the blend
 * @param canvas
 * @param blend
 */
function createBlendChart(canvas, blend) {
    const ctx = canvas.getContext('2d');
    const data = [];
    const labels = [];

    Object.entries(blend.flavors).forEach(([flavorId, percentage]) => {
        if (percentage > 0) {
            data.push(percentage);
            labels.push(blendableTeas[flavorId].name);
        }
    });

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(201, 203, 207, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Display user's saved blends
 * @param blends
 */
function displayUserBlends(blends) {
    const blendsList = document.getElementById('blendsList');
    blendsList.innerHTML = '';

    blends.forEach(blend => {
        const blendItem = document.createElement('div');
        blendItem.className = 'blend-item';

        let flavorsList = '<ul class="flavors-list">';
        Object.entries(blend.flavors).forEach(([flavorId, percentage]) => {
            if (percentage > 0 && blendableTeas[flavorId]) {
                flavorsList += `<li><span>${blendableTeas[flavorId].name}:</span> <span>${percentage}%</span></li>`;
            } else {
                console.warn(`Flavor with ID ${flavorId} not found in blendableTeas.`);
            }
        });
        flavorsList += '</ul>';

        blendItem.innerHTML = `
            <div class="blend-item-header">
                <h3>${blend.name}</h3>
                <p>Base Tea: ${blendableTeas[blend.baseTea] ? blendableTeas[blend.baseTea].name : 'Unknown Base Tea'}</p>
            </div>
            <div class="blend-details">
                <div class="saved-chart-container">
                    <canvas></canvas>
                </div>
                <div class="flavors-container">
                    <h4>Flavors:</h4>
                    ${flavorsList}
                </div>
            </div>
            <div class="blend-item-footer">
                <button class="button add-to-cart-btn">Add to Cart</button>
                <button class="remove-btn">Remove</button>
            </div>
        `;

        const canvas = blendItem.querySelector('.saved-chart-container canvas');
        createBlendChart(canvas, blend);

        blendItem.querySelector('.add-to-cart-btn').onclick = () => addToCart(blend.id);
        blendItem.querySelector('.remove-btn').onclick = () => removeBlend(blend.id);

        blendsList.appendChild(blendItem);
    });
}


/**
 * Remove a blend from the user's saved blends
 * @param blendId
 */
function removeBlend(blendId) {
    if (confirm('Are you sure you want to remove this blend?')) {
        fetch(`/store/remove-blend/${blendId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Blend removed successfully');
                    fetchAndDisplayUserBlends();
                } else {
                    alert('Error removing blend. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error removing blend:', error);
                alert(`Error removing blend: ${error.message}`);
            });
    }
}

/**
 * Add a blend to the user's cart
 * @param blendId
 */
function addToCart(blendId) {
    fetch('/store/add-blend-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blendId: blendId }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Blend added to cart!');
            } else {
                alert('Error adding blend to cart. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error adding blend to cart:', error);
            alert(`Error adding blend to cart: ${error.message}`);
        });
}

/**
 * Fetch and display user's saved blends
 */
function fetchAndDisplayUserBlends() {
    fetch('/store/user-blends')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(blends => displayUserBlends(blends))
        .catch(error => {
            console.error('Error fetching user blends:', error);
            alert('Failed to load user blends. Please try again later.');
        });
}
