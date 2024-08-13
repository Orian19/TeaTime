const bcrypt = require('bcrypt');
const { readUsers, writeUsers } = require('../persist');

const USERS_FILE = 'users.json';

/**
    * Register a new user
    * @param {string} username - The username of the user
    * @param {string} password - The password of the user
    * @param {boolean} isAdmin - Whether the user is an admin
    * @returns {Promise<void>}
    * @throws {Error} If the user already exists
 */
async function registerUser(username, password, isAdmin = false) {
    const users = await readUsers(USERS_FILE) || {};
    if (users[username]) {
        throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword, isAdmin };
    await writeUsers(USERS_FILE, users);
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
        return user;
    }
    return false;
}

/**
 * Initialize the admin user
 * @returns {Promise<void>}
 */
async function initAdmin() {
    const users = await readUsers(USERS_FILE) || {};
    if (!users.admin) {
        await registerUser('admin', 'admin', true);
    }
}

module.exports = {
    registerUser,
    authenticateUser,
    initAdmin
};
