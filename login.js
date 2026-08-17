"use strict";

const API_URL = "https://ai-code-tutor-studio.onrender.com";


// =========================================================
// EMAIL LOGIN
// =========================================================

const form = document.getElementById("loginForm");

if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please enter email and password.");
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || "Login failed.");
                return;
            }

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.location.href =
                "../dashboard/dashboard.html";

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            alert("Cannot connect to backend.");
        }

    });

}


// =========================================================
// GOOGLE LOGIN CALLBACK
// =========================================================

function handleGoogleLogin(response) {

    console.log("Google credential received");

    if (!response || !response.credential) {

        console.error("No Google credential received.");

        alert("Google login failed.");

        return;
    }

    loginWithGoogle(response.credential);
}


// =========================================================
// SEND GOOGLE TOKEN TO BACKEND
// =========================================================

async function loginWithGoogle(credential) {

    try {

        console.log("Sending Google credential to backend...");

        const response = await fetch(
            `${API_URL}/auth/google`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    credential: credential
                })
            }
        );

        const data = await response.json();

        console.log(
            "Google backend response:",
            data
        );

        if (!response.ok) {

            alert(
                data.detail ||
                "Google login failed."
            );

            return;
        }

        localStorage.setItem(
            "access_token",
            data.access_token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        console.log(
            "GOOGLE LOGIN SUCCESS"
        );

        window.location.href =
            "dashboard.html";

    } catch (error) {

        console.error(
            "GOOGLE LOGIN ERROR:",
            error
        );

        alert(
            "Unable to connect to authentication server."
        );
    }
}


// =========================================================
// INITIALIZE GOOGLE
// =========================================================

function initializeGoogleLogin() {

    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.id
    ) {

        console.log(
            "Waiting for Google Identity Services..."
        );

        setTimeout(
            initializeGoogleLogin,
            500
        );

        return;
    }


    google.accounts.id.initialize({

        client_id:
            "221221986548-23g9vo9mm06mtuo6hhohsmg8ujseudh5.apps.googleusercontent.com",

        callback:
            handleGoogleLogin,

        auto_select: false,

        cancel_on_tap_outside: true

    });


    const button =
        document.getElementById(
            "customGoogleButton"
        );


    if (!button) {

        console.error(
            "Custom Google button not found."
        );

        return;
    }


    // =====================================================
    // CUSTOM BUTTON CLICK
    // =====================================================

    button.addEventListener(
        "click",
        function () {

            console.log(
                "Google button clicked"
            );

            google.accounts.id.prompt();

        }
    );


    console.log(
        "Custom Google button ready."
    );
}


// =========================================================
// START
// =========================================================

window.addEventListener(
    "load",
    initializeGoogleLogin
);
