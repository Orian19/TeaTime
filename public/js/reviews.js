document.addEventListener('DOMContentLoaded', function() {
    const reviewsList = document.getElementById('reviews-list');
    const addReviewBtn = document.getElementById('add-review-btn');
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementsByClassName('close')[0];
    const reviewForm = document.getElementById('review-form');

    /**
     * Fetch reviews from the server
     * @returns {Promise<any>}
     */
    function fetchReviews() {
        return fetch('/store/reviews')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error fetching reviews:', error);
                return [];
            });
    }

    /**
     * Display reviews in the HTML
     */
    function displayReviews() {
        if (reviewsList.children.length > 0) {
            console.log('Reviews already present in HTML');
            return;
        }
        fetchReviews().then(reviews => {
            reviewsList.innerHTML = '';
            if (reviews.length === 0) {
                const messageElement = document.createElement('p');
                messageElement.textContent = "No reviews yet, be the first to add a review!";
                reviewsList.appendChild(messageElement);
            } else {
                reviews.forEach(function(review) {
                    const reviewElement = document.createElement('div');
                    reviewElement.className = 'review';
                    reviewElement.innerHTML = '<h3>' + review.name + '</h3>' +
                        '<p>Rating: ' + review.rating + '/5</p>' +
                        '<p>' + review.comment + '</p>' +
                        '<p>Date: ' + new Date(review.date).toLocaleDateString() + '</p>';
                    reviewsList.appendChild(reviewElement);
                });
            }
        });
    }

    /**
     * Add a new review to the HTML
     * @param review
     */
    function addNewReview(review) {
        const noReviewsMessage = reviewsList.querySelector('p');
        if (noReviewsMessage && noReviewsMessage.textContent.includes("No reviews yet")) {
            reviewsList.innerHTML = '';
        }
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        reviewElement.innerHTML = '<h3>' + review.name + '</h3>' +
            '<p>Rating: ' + review.rating + '/5</p>' +
            '<p>' + review.comment + '</p>' +
            '<p>Date: ' + new Date().toLocaleDateString() + '</p>';
        reviewsList.insertBefore(reviewElement, reviewsList.firstChild);
    }

    displayReviews();

    addReviewBtn.onclick = function() {
        modal.style.display = 'block';
    };

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newReview = {
            name: document.getElementById('name').value,
            rating: parseInt(document.getElementById('rating').value),
            comment: document.getElementById('comment').value
        };

        fetch('/store/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newReview),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Review added successfully:', data);
                addNewReview(newReview);
                modal.style.display = 'none';
                reviewForm.reset();
            })
            .catch((error) => {
                console.error('Error adding review:', error);
                alert('There was an issue submitting your review. Please try again later.');
            });
    });
});
