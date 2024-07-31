const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, modifyProduct, removeProduct } = require('../modules/products');

// GET admin page
router.get('/', async (req, res) => {
    if(!req.session.user || !req.session.user.admin) {
        return res.redirect('/auth/login');
    }
    const products = await getProducts();
    res.render('admin', { products, user: req.session.user });
});

// GET add product page
router.get('/add', (req, res) => {
    if(!req.session.user || !req.session.user.admin) {
        return res.redirect('/auth/login');
    }
    res.render('add-product', { user: req.session.user });
});

// POST add product
router.post('/add', async (req, res) => {
    if(!req.session.user || !req.session.user.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { name, price, description, category, origin, caffeine, brewingTime, temperature, imageUrl } = req.body;
    const product = { name, price, description, category, origin, caffeine, brewingTime, temperature, imageUrl };
    await createProduct(product);
    res.redirect('/admin');
});

// GET edit product page
router.get('/edit/:id', async (req, res) => {
    if(!req.session.user || !req.session.user.admin) {
        return res.redirect('/auth/login');
    }
    const product = await getProduct(req.params.id);
    if(!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.render('edit-product', { product, user: req.session.user });
});

// POST edit product
router.post('/edit/:id', async (req, res) => {
    if(!req.session.user || !req.session.user.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { name, price, description, category, origin, caffeine, brewingTime, temperature, imageUrl } = req.body;
    const product = { id: req.params.id, name, price, description, category, origin, caffeine, brewingTime, temperature, imageUrl };
    await modifyProduct(product);
    res.redirect('/admin');
});

// DELETE product
router.delete('/delete/:id', async (req, res) => {
    if(!req.session.user || !req.session.user.admin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    await removeProduct(req.params.id);
    res.json({ message: 'Product deleted' });
});

module.exports = router;
