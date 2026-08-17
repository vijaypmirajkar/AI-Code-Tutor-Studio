"use strict";

const API_URL = "https://ai-code-tutor-studio.onrender.com";

async function login(email, password) {

    console.log("LOGIN STARTED");
    console.log("Email:", email);
    console.log("Backend:", API_URL);

    try {

        const response = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email.trim(),
                    password: password
                })
            }
        );

        console.log(
            "LOGIN RESPONSE STATUS:",
            response.status
        );

        let data;

        try {

            data = await response.json();

        } catch (error) {

            console.error(
                "Invalid JSON response:",
                error
            );

            alert(
                "Server returned an invalid response."
            );

            return false;
        }

        console.log(
            "LOGIN RESPONSE:",
            data
        );

        if (!response.ok) {

            alert(
                data.detail ||
                data.message ||
                "Login failed."
            );

            return false;
        }

        if (!data.access_token) {

            console.error(
                "Access token missing:",
                data
            );

            alert(
                "Login failed: access token was not returned."
            );

            return false;
        }

        // ============================================
        // SAVE LOGIN SESSION
        // ============================================

        localStorage.setItem(
            "access_token",
            data.access_token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(
                data.user || {}
            )
        );

        console.log(
            "LOGIN SUCCESS"
        );

        console.log(
            "USER:",
            data.user
        );

        // ============================================
        // REDIRECT
        // ============================================

        window.location.href =
            "dashboard.html";

        return true;

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        alert(
            "Unable to connect to the server. Please try again."
        );

        return false;
    }
}
