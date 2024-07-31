// complete adimin routes
const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, modifyProduct, removeProduct } = require('../modules/products');

// GET admin page
router.get('/', async (req, res) => {
    if(!req.session.user) {
        return res.redirect('/auth/login');
    }
    const products = await getProducts();
    console.log('Products:', products);
    res.render('admin', { products, user: req.session.user });
});

// GET add product page
router.get('/add-product', (req, res) => {
    if(!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('add-product', { user: req.session.user });
});

// POST add product
router.post('/add-product', async (req, res) => {
    if(!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { name, price } = req.body;
    if(!name || !price) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    await createProduct({ name, price });
    res.redirect('/admin');
});

// GET edit product page
router.get('/edit-product/:id', async (req, res) => {
    if(!req.session.user) {
        return res.redirect('/auth/login');
    }
    const product = await getProduct(req.params.id);
    if(!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.render('edit-product', { product, user: req.session.user });
});

// POST edit product
router.post('/edit-product', async (req, res) => {
    if(!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { id, name, price } = req.body;
    if(!id || !name || !price) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    await modifyProduct({ id, name, price });
    res.redirect('/admin');
});

// DELETE product
router.delete('/delete-product/:id', async (req, res) => {
    if(!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    await removeProduct(req.params.id);
    res.json({ message: 'Product deleted' });
});

module.exports = router;
