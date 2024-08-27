const bcrypt = require('bcrypt');
const { readUsers, writeUsers } = require('../persist');
const { isAdmin } = require('../modules/admin');

const USERS_FILE = 'users.json';

/**
    * Register a new user
    * @param {string} username - The username of the user
    * @param {string} password - The password of the user
    * @param {boolean} isAdmin - Whether the user is an admin
    * @returns {Promise<boolean>}
    * @throws {Error} If the user already exists
 */
async function registerUser(username, password, isAdmin = false) {
    const users = await readUsers(USERS_FILE) || {};
    if (users[username]) {
        return false;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword, isAdmin };
    await writeUsers(USERS_FILE, users);
    return true;
}

/**
 * Authenticate a user
 * @param username
 * @param password
 * @returns {Promise<object|boolean>} The user object if authentication is successful, false otherwise
 */
async function authenticateUser(username, password) {
    const users = await readUsers(USERS_FILE) || {};
    const user = users[username];
    
    if (user && await bcrypt.compare(password, user.password)) {
        return { username, isAdmin: user.isAdmin };
    }

    return false;
}

function isAuthenticated(req, res, next) {
    if (req.session.username) {
        return next();
    }

    res.redirect('/auth/login');
}


/**
 * Initialize the admin user
 * @returns {Promise<void>}
 */
async function initAdmin() {
    try {
        const users = await readUsers(USERS_FILE) || {};
        
        // Check if any user has admin privileges
        const adminExists = Object.values(users).some(user => user.isAdmin);

        if (!adminExists) {
            await registerUser('admin', 'admin', true);
            console.log('Admin user initialized successfully');
        } else {
            console.log('Admin user already exists');
        }
        
    } catch (error) {
        console.error('Error initializing admin user:', error);
        throw error;
    }
}

module.exports = {
    registerUser,
    authenticateUser,
    isAuthenticated,
    initAdmin
};
