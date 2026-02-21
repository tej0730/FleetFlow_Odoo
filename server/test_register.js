async function testRegister() {
    console.log("=== Testing Registration ===");
    try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'New Developer',
                email: 'testdev@fleetflow.test',
                password: 'password123',
                role: 'manager'
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);

        if (data.token) {
            console.log("Registration SUCCEEDED!");
        } else {
            console.log("Registration FAILED!");
        }
    } catch (e) {
        console.error("Test Error:", e);
    }
}
testRegister();
