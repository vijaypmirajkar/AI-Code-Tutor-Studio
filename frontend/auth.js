const API_URL = "https://ai-code-tutor-studio.onrender.com";

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Login failed");
            return;
        }

        // Save token and user
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Login Successful!");

        // Redirect to dashboard
        window.location.href = "../dashboard/dashboard.html";

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
}
