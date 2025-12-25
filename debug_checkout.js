
// Removed require since Node 22 has global fetch
async function run() {
    const url = "https://myrthifravcxvcqlptcp.supabase.co/functions/v1/create-checkout-session";
    const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cnRoaWZyYXZjeHZjcWxwdGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjA2MDQsImV4cCI6MjA3OTg5NjYwNH0.IO3AawigN1Vm3U842gTiiIw9oMMBNl3z9XDYuUaPMEI";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${anonKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                priceId: "price_1SgyE83Cjm2NVorHaMQTmC0T",
                userId: "test-user",
                planType: "standard"
            })
        });

        const status = response.status;
        const text = await response.text();

        console.log(`Status: ${status}`);
        console.log(`Body: ${text}`);
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
