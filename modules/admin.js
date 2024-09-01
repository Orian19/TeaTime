const fs = require('fs').promises;
const path = require('path');

const ACTIVITIES_FILE = path.join(__dirname, '..', 'data', 'activities.json');

/**
 * check if user is admin
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
        return next();
    }
    
    res.status(403).send('Access denied');
}

/**
 * get user activities
 * @returns {Promise<*|*[]>}
 */
async function getUserActivities() {
    try {
        const data = await fs.readFile(ACTIVITIES_FILE, 'utf8');
        const activities = JSON.parse(data);
        
        // Ensure activities is an array and filter out invalid entries
        return Array.isArray(activities) ? activities.filter(activity => 
            activity && typeof activity === 'object' && 'username' in activity
        ) : [];

    } catch (error) {
        if (error.code === 'ENOENT') {
            // If the file doesn't exist, return an empty array
            return [];
        }
        console.error('Error reading activities file:', error);
        return [];
    }
}

/**
 * add user activity
 * @param activity
 * @returns {Promise<void>}
 */
async function addUserActivity(activity) {
    const activities = await getUserActivities();
    activities.push({
        ...activity,
        datetime: new Date().toISOString() // Ensure we always have a datetime
    });
    
    await fs.writeFile(ACTIVITIES_FILE, JSON.stringify(activities, null, 2));
}

module.exports = {
    isAdmin,
    getUserActivities,
    addUserActivity
};
