document.addEventListener('DOMContentLoaded', function() {
    var reviewsList = document.getElementById('reviews-list');
    var addReviewBtn = document.getElementById('add-review-btn');
    var modal = document.getElementById('modal');
    var closeBtn = document.getElementsByClassName('close')[0];
    var reviewForm = document.getElementById('review-form');

    function fetchReviews() {
        return fetch('/store/reviews')
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching reviews:', error);
                return [];
            });
    }

    function displayReviews() {
        if (reviewsList.children.length > 0) {
            console.log('Reviews already present in HTML');
            return;
        }
        fetchReviews().then(reviews => {
            reviewsList.innerHTML = '';
            if (reviews.length === 0) {
                var messageElement = document.createElement('p');
                messageElement.textContent = "No reviews yet, be the first to add a review!";
                reviewsList.appendChild(messageElement);
            } else {
                reviews.forEach(function(review) {
                    var reviewElement = document.createElement('div');
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

    function addNewReview(review) {
        var noReviewsMessage = reviewsList.querySelector('p');
        if (noReviewsMessage && noReviewsMessage.textContent.includes("No reviews yet")) {
            reviewsList.innerHTML = '';
        }
        var reviewElement = document.createElement('div');
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
        var newReview = {
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
        });
    });
});