const fs = require('fs');
const path = require('path');
const reviewsFilePath = path.join(__dirname, '../data/reviews.json');

/**
 * Read reviews from file
 * @returns {any|*[]}
 */
function readReviews() {
    try {
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

        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading reviews file:', error);
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
    try {
        fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
    } catch (error) {
        console.error('Error writing to reviews file:', error);
        throw new Error('Failed to save reviews. Please try again later.');
    }
}

/**
 * Get all reviews
 * @returns {*|*[]}
 */
function getReviews() {
    try {
        return readReviews();
    } catch (error) {
        console.error('Error getting reviews:', error);
        throw new Error('Failed to retrieve reviews. Please try again later.');
    }
}

/**
 * Add a new review
 * @param review
 */
function addReview(review) {
    try {
        const reviews = readReviews();
        review.date = new Date().toISOString();
        reviews.push(review);
        writeReviews(reviews);
    } catch (error) {
        console.error('Error adding review:', error);
        throw new Error('Failed to add review. Please try again later.');
    }
}

/**
 * Remove a review
 * @param reviewIndex
 */
function removeReview(reviewIndex) {
    try {
        const reviews = readReviews();
        if (reviewIndex >= 0 && reviewIndex < reviews.length) {
            reviews.splice(reviewIndex, 1);
            writeReviews(reviews);
        } else {
            throw new Error('Review not found');
        }
    } catch (error) {
        console.error('Error removing review:', error);
        throw new Error('Failed to remove review. Please try again later.');
    }
}

/**
 * Update a review
 * @param reviewIndex
 * @param updatedReview
 */
function updateReview(reviewIndex, updatedReview) {
    try {
        const reviews = readReviews();
        if (reviewIndex >= 0 && reviewIndex < reviews.length) {
            reviews[reviewIndex] = updatedReview;
            writeReviews(reviews);
        } else {
            throw new Error('Review not found');
        }
    } catch (error) {
        console.error('Error updating review:', error);
        throw new Error('Failed to update review. Please try again later.');
    }
}

module.exports = {
    getReviews,
    addReview,
    removeReview,
    updateReview
};
