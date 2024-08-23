const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log("Starting tests...");

    await testHomePage();
    await testRegister();
    await testLogin();
    await testStore();
    await testSearch();
    await testAddToCart();
    await testCartPage();
    await testCheckout();
    await testReviews();
    await testQuiz();
    await testTeaBlender();
    await testMap();
    await testAdminPage();
    await testCustomBlend();
    await testLogout();

    console.log("All tests completed.");
}

async function testHomePage() {
    console.log("Testing Home Page...");
    const response = await fetch(BASE_URL);
    console.log(`Home Page Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testRegister() {
    console.log("Testing Register...");
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'newuser', password: 'newpass' })
    });
    console.log(`Register Test: ${response.ok || response.status === 400 ? "Passed" : "Failed"}`);
}

async function testLogin() {
    console.log("Testing Login...");
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    console.log(`Login Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testLogout() {
    console.log("Testing Logout...");
    const response = await fetch(`${BASE_URL}/auth/logout`);
    console.log(`Logout Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testStore() {
    console.log("Testing Store Page...");
    const response = await fetch(`${BASE_URL}/store`);
    console.log(`Store Page Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testSearch() {
    console.log("Testing Search...");
    const response = await fetch(`${BASE_URL}/store/search?query=tea`);
    console.log(`Search Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testAddToCart() {
    console.log("Testing Add to Cart...");
    const response = await fetch(`${BASE_URL}/store/add-to-cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'someProductId', quantity: 1 })
    });
    console.log(`Add to Cart Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testCartPage() {
    console.log("Testing Cart Page...");
    const response = await fetch(`${BASE_URL}/store/cart`);
    console.log(`Cart Page Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testCheckout() {
    console.log("Testing Checkout...");
    const response = await fetch(`${BASE_URL}/store/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* checkout details */ })
    });
    console.log(`Checkout Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testReviews() {
    console.log("Testing Reviews Page...");
    const response = await fetch(`${BASE_URL}/store/reviews`);
    console.log(`Reviews Page Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testQuiz() {
    console.log("Testing Quiz Page...");
    const response = await fetch(`${BASE_URL}/store/quiz`);
    console.log(`Quiz Page Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testTeaBlender() {
    console.log("Testing Tea Blender Page...");
    const response = await fetch(`${BASE_URL}/store/tea-blender`);
    console.log(`Tea Blender Page Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testMap() {
    console.log("Testing Map Page...");
    const response = await fetch(`${BASE_URL}/store/map`);
    console.log(`Map Page Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testAdminPage() {
    console.log("Testing Admin Page...");
    const response = await fetch(`${BASE_URL}/admin`);
    console.log(`Admin Page Test: ${response.status === 403 || response.ok ? "Passed" : "Failed"}`);
}


async function testCustomBlend() {
    console.log("Testing Custom Blend...");
    const response = await fetch(`${BASE_URL}/store/tea-blender`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* blend details */ })
    });
    console.log(`Custom Blend Test: ${response.ok ? "Passed" : "Failed"}`);
}

async function testLogout() {
    console.log("Testing Logout...");
    const response = await fetch(`${BASE_URL}/auth/logout`);
    console.log(`Logout Test: ${response.ok ? "Passed" : "Failed"}`);
}

runTests().catch(console.error);