const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
let authCookie = '';
let testBlendId = null;

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
    await testUpdateCartQuantity();
    await testRemoveFromCart();
    await testAddReview();
    await testSearchNoResults();
    await testPagination();
    await testFilterProducts();
    await testBlendableTeas();
    await testGetUserBlends();
    await testGetTeaRegions();
    await testLogout();
    await testInvalidLogin();
    await testRegisterExistingUser();

    console.log("All tests completed.");
}

async function testHomePage() {
    console.log("Testing Home Page...");
    const response = await fetch(BASE_URL);
    logTestResult("Home Page", response.ok);
}

async function testRegister() {
    console.log("Testing Register...");
    const username = `testuser${Date.now()}`;
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: 'testpass' })
    });
    logTestResult("Register", response.ok || response.status === 400);
}

async function testLogin() {
    console.log("Testing Login...");
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin' })
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (isJson) {
        const data = await response.json();
        if (response.ok && data.success) {
            authCookie = response.headers.get('set-cookie');
            logTestResult("Login", true);
        } else {
            logTestResult("Login", false);
        }
    } else {
        const responseText = await response.text();
        if (response.ok && responseText.includes('TeaTime')) {
            authCookie = response.headers.get('set-cookie');
            logTestResult("Login", true);
        } else {
            logTestResult("Login", false);
        }
    }
}

async function testStore() {
    console.log("Testing Store Page...");
    const response = await fetch(`${BASE_URL}/store`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Store Page", response.ok);
}

async function testSearch() {
    console.log("Testing Search...");
    const response = await fetch(`${BASE_URL}/store/search?search=tea`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Search", response.ok);
}

async function testAddToCart() {
    console.log("Testing Add to Cart...");
    const response = await fetch(`${BASE_URL}/store/add-to-cart`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': authCookie
        },
        body: JSON.stringify({ productId: '1', quantity: 1 })
    });
    logTestResult("Add to Cart", response.ok);
}

async function testCartPage() {
    console.log("Testing Cart Page...");
    const response = await fetch(`${BASE_URL}/store/cart`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Cart Page", response.ok);
}

async function testCheckout() {
    console.log("Testing Checkout...");
    const response = await fetch(`${BASE_URL}/store/checkout`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Checkout", response.ok);
}

async function testReviews() {
    console.log("Testing Reviews Page...");
    const response = await fetch(`${BASE_URL}/store/reviews`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Reviews Page", response.ok);
}

async function testQuiz() {
    console.log("Testing Quiz Page...");
    const response = await fetch(`${BASE_URL}/store/quiz`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Quiz Page", response.ok);
}

async function testTeaBlender() {
    console.log("Testing Tea Blender Page...");
    const response = await fetch(`${BASE_URL}/store/tea-blender`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Tea Blender Page", response.ok);
}

async function testMap() {
    console.log("Testing Map Page...");
    const response = await fetch(`${BASE_URL}/store/map`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Map Page", response.ok);
}

async function testAdminPage() {
    console.log("Testing Admin Page...");
    const response = await fetch(`${BASE_URL}/admin`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Admin Page", response.ok || response.status === 403);
}

async function testCustomBlend() {
    console.log("Testing Custom Blend...");
    const response = await fetch(`${BASE_URL}/store/tea-blender`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': authCookie
        },
        body: JSON.stringify({ name: 'Test Blend', ingredients: ['green tea', 'jasmine'] })
    });
    logTestResult("Custom Blend", response.ok);
}

async function testUpdateCartQuantity() {
    console.log("Testing Update Cart Quantity...");
    const response = await fetch(`${BASE_URL}/store/update-quantity`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': authCookie
        },
        body: JSON.stringify({ itemId: '1', quantity: 2, itemType: 'product' })
    });
    logTestResult("Update Cart Quantity", response.ok);
}

async function testRemoveFromCart() {
    console.log("Testing Remove from Cart...");
    const response = await fetch(`${BASE_URL}/store/remove-item`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': authCookie
        },
        body: JSON.stringify({ itemId: '1', itemType: 'product' })
    });
    logTestResult("Remove from Cart", response.ok);
}

async function testAddReview() {
    console.log("Testing Add Review...");
    const response = await fetch(`${BASE_URL}/store/reviews`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': authCookie
        },
        body: JSON.stringify({ name: 'Test User', rating: 5, comment: 'Great product!' })
    });
    logTestResult("Add Review", response.ok);
}

async function testLogout() {
    console.log("Testing Logout...");
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Logout", response.ok);
}

async function testInvalidLogin() {
    console.log("Testing Invalid Login...");
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'invaliduser', password: 'wrongpassword' })
    });
    
    const html = await response.text();
    
    logTestResult("Invalid Login", 
        response.status === 401 && 
        html.includes('Invalid username or password') && 
        !response.headers.get('set-cookie') 
    );
}

async function testRegisterExistingUser() {
    console.log("Testing Register Existing User...");
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'password' })
    });
    logTestResult("Register Existing User", response.status === 400);
}

async function testSearchNoResults() {
    console.log("Testing Search with No Results...");
    const response = await fetch(`${BASE_URL}/store/search?search=nonexistentproduct`, {
        headers: { 'Cookie': authCookie }
    });
    const body = await response.text();
    logTestResult("Search No Results", response.ok && body.includes(""));
}

async function testPagination() {
    console.log("Testing Pagination...");
    const response = await fetch(`${BASE_URL}/store?page=2`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Pagination", response.ok);
}

async function testFilterProducts() {
    console.log("Testing Filter Products...");
    const response = await fetch(`${BASE_URL}/store?origin=China`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Filter Products", response.ok);
}

async function testBlendableTeas() {
    console.log("Testing Get Blendable Teas...");
    const response = await fetch(`${BASE_URL}/store/blendable-teas`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Get Blendable Teas", response.ok);
}

async function testGetUserBlends() {
    console.log("Testing Get User Blends...");
    const response = await fetch(`${BASE_URL}/store/user-blends`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Get User Blends", response.ok);
}

async function testCreateBlend() {
    console.log("Testing Create Blend...");
    const blendData = {
        blendName: "Test Custom Blend",
        baseTea: "BT001",
        flavors: {
            "F001": 30,  
            "F002": 40, 
            "F003": 30   
        }
    };

    const response = await fetch(`${BASE_URL}/store/tea-blender`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Cookie': authCookie
        },
        body: JSON.stringify(blendData)
    });

    if (response.ok) {
        const result = await response.json();
        testBlendId = result.id;  // Save the blend ID for later tests
        logTestResult("Create Blend", true);
    } else {
        logTestResult("Create Blend", false);
        console.error("Failed to create blend:", await response.text());
    }
}

async function testRemoveBlend() {
    console.log("Testing Remove Blend...");
    if (!testBlendId) {
        console.log("No blend ID available. Skipping remove blend test.");
        return;
    }

    const response = await fetch(`${BASE_URL}/store/remove-blend/${testBlendId}`, {
        method: 'DELETE',
        headers: { 'Cookie': authCookie }
    });

    const result = await response.json();
    logTestResult("Remove Blend", response.ok && result.success);
}

async function testGetTeaRegions() {
    console.log("Testing Get Tea Regions...");
    const response = await fetch(`${BASE_URL}/store/api/tea-regions`, {
        headers: { 'Cookie': authCookie }
    });
    logTestResult("Get Tea Regions", response.ok);
}

function logTestResult(testName, passed) {
    console.log(`${testName} Test: ${passed ? "Passed" : "Failed"}`);
}

runTests().catch(error => {
    console.error("An error occurred during testing:", error);
});