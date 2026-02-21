async function runTests() {
    console.log("=== Running API Tests ===");

    try {
        // 1. Login
        console.log("Testing Login...");
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'manager@fleetflow.test', password: 'password123' })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) throw new Error(`Login Failed: ${JSON.stringify(loginData)}`);
        console.log("Login Success! Token received.");
        const token = loginData.token;

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. Fetch Dashboard Stats
        console.log("\nTesting Dashboard Stats...");
        const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', { headers });
        const statsData = await statsRes.json();
        console.log("Stats Data:", statsData);

        // 3. Test Validation Logic (Overweight Cargo)
        console.log("\nTesting Cargo Validation...");
        const tripRes = await fetch('http://localhost:5000/api/trips', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                vehicle_id: 1, // Max capacity 1000
                driver_id: 1,
                cargo_weight_kg: 5000, // Deliberately overweight
                origin: "Test A",
                destination: "Test B"
            })
        });
        const tripData = await tripRes.json();
        console.log("Creating Overweight Trip Result (Should be 400 Bad Request):", tripRes.status, tripData);

        console.log("\nAll tests completed!");

    } catch (e) {
        console.error("Test Error:", e);
    }
}

runTests();
