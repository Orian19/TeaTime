const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, authenticateUser } = require('../modules/user');
const { addUserActivity } = require('../modules/admin');

// Rate limiter for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts. Please try again later.',
});

// Register a new user
router.get('/register', (req, res) => {
    res.render('register');
});

// Register a new user - POST
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Basic input validation
        if (!username || !password || username.length < 3 || password.length < 8) {
            return res.status(400).render('register', { error: 'Invalid username (at lease 3 chars) or password (at least 8 chars)' });
        }

        const isRegistered = await registerUser(username, password);
        if (isRegistered) {
            await addUserActivity({
                username: req.body.username,
                type: 'register',
            });
            res.redirect('/auth/login');
        } else {
            console.log(`User already exists with username: ${req.body.username}`);
            res.status(400).render('register', { error: 'User already exists' });
        }
    } catch (error) {
        console.error(`Error during registration: ${error.message}`);
        res.status(500).send('An error occurred during registration');
    }
});

// Login
router.get('/login', (req, res) => {
    res.render('login');
});

// Login - POST with rate limiter
router.post('/login', loginLimiter, async (req, res) => {
    const { username, password, rememberMe } = req.body;
    console.log(`Attempting login with username: ${username}`);
    try {
        const user = await authenticateUser(username, password);
        if (user) {
            req.session.username = username;
            req.session.isAdmin = user.isAdmin;
            if (rememberMe) {
                req.session.cookie.maxAge = 10 * 24 * 60 * 60 * 1000; // 10 days
            } else {
                req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
            }
            req.session.cookie.httpOnly = true; // Prevents client-side JS from accessing the cookie
            req.session.cookie.sameSite = 'Strict'; // CSRF protection

            console.log(`Login successful for username: ${username}`);
            await addUserActivity({
                username: req.session.username,
                type: 'login',
            });

            res.redirect('/store');
        } else {
            console.log(`Login failed for username: ${username}`);
            res.status(401).render('login', { error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(`Error during login for username: ${username}: ${error.message}`);
        res.status(500).send('An error occurred during login');
    }
});

// Logout
router.get('/logout', async (req, res) => {
    try {
        await addUserActivity({
            username: req.session.username,
            type: 'logout',
        });

        req.session.destroy(err => {
            if (err) {
                return console.error(err);
            }

            res.clearCookie('connect.sid'); // Clear session cookie
            res.redirect('/auth/login');
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).send('An error occurred during logout');
    }
});

module.exports = router;
