const bcrypt = require('bcrypt');
const { readUsers, writeUsers } = require('../persist');

const USERS_FILE = 'users.json';

/**
    * Register a new user
    * @param {string} username - The username of the user
    * @param {string} password - The password of the user
    * @returns {Promise<void>}
    * @throws {Error} If the user already exists
 */
async function registerUser(username, password) {
    const users = await readUsers(USERS_FILE) || {};
    if (users[username]) {
        throw new Error('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };
    await writeUsers(USERS_FILE, users);
}

/**
 * Authenticate a user
 * @param username
 * @param password
 * @returns {Promise<void|*|boolean>}
 */
async function authenticateUser(username, password) {
    const users = await readUsers(USERS_FILE) || {};
    const user = users[username];
    if (!user) {
        return false;
    }
    return await bcrypt.compare(password, user.password);
}

/**
 * Initialize the admin use
 * @returns {Promise<void>}
 */
async function initAdmin() {
    const users = await writeUsers(USERS_FILE, users) || {};
    if (!users.admin) {
        await registerUser('admin', 'admin');
    }
}

module.exports = {
    registerUser,
    authenticateUser,
    initAdmin
};
