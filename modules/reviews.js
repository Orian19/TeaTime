const fs = require('fs');
const path = require('path');
const reviewsFilePath = path.join(__dirname, '../data/reviews.json');

/**
 * Read reviews from file
 * @returns {any|*[]}
 */
function readReviews() {
    if (!fs.existsSync(reviewsFilePath)) {
        console.log('Reviews file does not exist. Creating an empty file.');
        fs.writeFileSync(reviewsFilePath, '[]');
        return [];
    }
    
    const data = fs.readFileSync(reviewsFilePath, 'utf8');
    
    if (!data.trim()) {
        console.log('Reviews file is empty. Initializing with an empty array.');
        fs.writeFileSync(reviewsFilePath, '[]');
        return [];
    }
    
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing reviews JSON:', error);
        console.log('Resetting reviews file to an empty array.');
        fs.writeFileSync(reviewsFilePath, '[]');
        return [];
    }
}

/**
 * Write reviews to file
 * @param reviews
 */
function writeReviews(reviews) {
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
}

/**
 * Get all reviews
 * @returns {*|*[]}
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