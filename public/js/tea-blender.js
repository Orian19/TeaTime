let blendChart;
let blendableTeas = {};

document.addEventListener('DOMContentLoaded', function() {
    const blendForm = document.getElementById('blendForm');
    const flavorInputs = document.querySelectorAll('#flavorComponents input[type="range"]');
    const ctx = document.getElementById('blendChart').getContext('2d');

    // Fetch blendable teas data
    fetch('/store/blendable-teas')
        .then(response => response.json())
        .then(teas => {
            blendableTeas = teas.reduce((acc, tea) => {
                acc[tea.id] = tea;
                return acc;
            }, {});
        })
        .catch(error => console.error('Error fetching blendable teas:', error));

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
            blendName: blendName,
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
            alert('Blend created successfully!');
            fetchAndDisplayUserBlends();
        } catch (error) {
            console.error('Error creating blend:', error);
            alert(error.message);
        }
    });

    updateChart(); // Initialize empty chart
    fetchAndDisplayUserBlends();
});

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

function displayUserBlends(blends) {
    const blendsList = document.getElementById('blendsList');
    blendsList.innerHTML = '';

    blends.forEach(blend => {
        const blendItem = document.createElement('div');
        blendItem.className = 'blend-item';
        
        const chartContainer = document.createElement('div');
        chartContainer.className = 'saved-chart-container';
        const canvas = document.createElement('canvas');
        chartContainer.appendChild(canvas);

        let flavorsList = '<ul class="flavors-list">';
        Object.entries(blend.flavors).forEach(([flavorId, percentage]) => {
            if (percentage > 0) {
                flavorsList += `<li>${blendableTeas[flavorId].name}: ${percentage}%</li>`;
            }
        });
        flavorsList += '</ul>';

        blendItem.innerHTML = `
            <h3>${blend.name}</h3>
            <p>Base Tea: ${blendableTeas[blend.baseTea].name}</p>
            <div class="blend-details">
                <div class="saved-chart-container"></div>
                <div class="flavors-container">
                    <h4>Flavors:</h4>
                    ${flavorsList}
                </div>
            </div>
        `;
        
        blendItem.querySelector('.saved-chart-container').appendChild(canvas);
        
        const addToCartButton = document.createElement('button');
        addToCartButton.textContent = 'Add to Cart';
        addToCartButton.onclick = () => addToCart(blend.id);
        blendItem.appendChild(addToCartButton);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove Blend';
        removeButton.onclick = () => removeBlend(blend.id);
        removeButton.className = 'remove-blend-btn';
        blendItem.appendChild(removeButton);

        blendsList.appendChild(blendItem);
        
        createBlendChart(canvas, blend);
    });
}

function removeBlend(blendId) {
    if (confirm('Are you sure you want to remove this blend?')) {
        fetch(`/store/remove-blend/${blendId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Blend removed successfully');
                fetchAndDisplayUserBlends();
            } else {
                alert('Error removing blend. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error removing blend. Please try again.');
        });
    }
}

function addToCart(blendId) {
    fetch('/store/add-blend-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blendId: blendId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Blend added to cart!');
        } else {
            alert('Error adding blend to cart. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error adding blend to cart. Please try again.');
    });
}

function fetchAndDisplayUserBlends() {
    fetch('/store/user-blends')
        .then(response => response.json())
        .then(blends => displayUserBlends(blends))
        .catch(error => console.error('Error fetching user blends:', error));
}