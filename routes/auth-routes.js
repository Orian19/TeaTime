const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser } = require('../modules/user');
const { addUserActivity } = require('../modules/admin');

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        await registerUser(req.body.username, req.body.password);
        await addUserActivity({
            username: req.body.username,
            type: 'register'
        });
        res.redirect('/auth/login');
    } catch(error) {
        res.status(400).send(error.message);
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password, rememberMe } = req.body;
    console.log(`Attempting login with username: ${username}`);
    try {
        const user = await authenticateUser(username, password);
        if(user) {
            req.session.username = username;
            req.session.isAdmin = user.isAdmin; // Set isAdmin in the session if the user is an admin
            if (rememberMe) {
                req.session.cookie.maxAge = 10 * 24 * 60 * 60 * 1000; // 10 days
            }
            console.log(`Login successful for username: ${username}`);
            await addUserActivity({
                username: req.body.username,
                type: 'login'
            });
            res.redirect('/store');
        } else {
            console.log(`Login failed for username: ${username}`);
            res.status(401).send('Invalid username or password');
        }
    } catch(error) {
        console.error(`Error during login for username: ${username}: ${error.message}`);
        res.status(500).send('An error occurred during login');
    }
});

router.get('/logout', async (req, res) => {
    await addUserActivity({
        username: req.body.username,
        type: 'logout'
    });
    req.session.destroy(err => {
        if(err) {
            console.error(err);
        }
        res.redirect('/auth/login');
    })
});


module.exports = router;
