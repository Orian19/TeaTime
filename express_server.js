const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = 3000;

// layout
const expressLayouts = require('express-ejs-layouts');

// secret key for session
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');

// layout
app.use(expressLayouts);
app.set('layout', 'layout');

// middleware - body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // todo: makes sure cookies work!!! (cause i dont think they do)
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 } // 30 minutes
}));

// middleware to set user variable
app.use((req, res, next) => {
    res.locals.user = {
        username: req.session.username || false,
        isAdmin: req.session.isAdmin || false
    };
    
    next();
});

// set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// routes
const adminRoutes = require('./routes/admin-routes');
const authRoutes = require('./routes/auth-routes');
const storeRoutes = require('./routes/store-routes');

const { getFeaturedProducts } = require('./modules/products');

// root route
app.get('/', async (req, res) => {
    try {
        const featuredProducts = await getFeaturedProducts();
        res.render('home', { featuredProducts });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).send('An error occurred while loading the home page');
    }
});

app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/store', storeRoutes);

// start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
