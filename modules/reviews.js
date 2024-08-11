const fs = require('fs');
const path = require('path');

const reviewsFilePath = path.join(__dirname, '../data/reviews.json');

/**
 * Read reviews from the JSON file
 * @returns {Array}
 */
function readReviews() {
    if (!fs.existsSync(reviewsFilePath)) {
        return []; // Return empty array if file does not exist
    }
    const data = fs.readFileSync(reviewsFilePath);
    return JSON.parse(data);
}

/**
 * Write reviews to the JSON file
 * @param reviews
 */
function writeReviews(reviews) {
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
}

/**
 * Get all reviews
 * @returns {Array}
 */
function getReviews() {
    return readReviews();
}

/**
 * Add a new review
 * @param review
 */
function addReview(review) {
    const reviews = readReviews();
    review.date = new Date().toISOString();
    reviews.push(review);
    writeReviews(reviews);
}

/**
 * Remove a review
 * @param reviewIndex
 */
function removeReview(reviewIndex) {
    const reviews = readReviews();
    if (reviewIndex >= 0 && reviewIndex < reviews.length) {
        reviews.splice(reviewIndex, 1);
        writeReviews(reviews);
    } else {
        throw new Error('Review not found');
    }
}

/**
 * Update a review
 * @param reviewIndex
 * @param updatedReview
 */
function updateReview(reviewIndex, updatedReview) {
    const reviews = readReviews();
    if (reviewIndex >= 0 && reviewIndex < reviews.length) {
        reviews[reviewIndex] = updatedReview;
        writeReviews(reviews);
    } else {
        throw new Error('Review not found');
    }
}

module.exports = {
    getReviews,
    addReview,
    removeReview,
    updateReview
};
