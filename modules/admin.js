// modules/admin.js
const fs = require('fs').promises;
const path = require('path');

const ACTIVITIES_FILE = path.join(__dirname, '..', 'data', 'activities.json');

function isAdmin(req, res, next) {
    if (req.session.isAdmin) {
      return next();
    }
    res.status(403).send('Access denied');
  }

async function getUserActivities() {
    try {
        const data = await fs.readFile(ACTIVITIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // If the file doesn't exist, return an empty array
            return [];
        }
        throw error;
    }
}

async function filterUserActivities(prefix) {
    const activities = await getUserActivities();
    return activities.filter(activity => activity.username.toLowerCase().startsWith(prefix.toLowerCase()));
}

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
    filterUserActivities, 
    addUserActivity
};