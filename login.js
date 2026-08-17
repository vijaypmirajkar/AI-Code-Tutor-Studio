// =========================================================
// LOGIN.JS
// AI CODE TUTOR STUDIO
// =========================================================

"use strict";

const form = document.getElementById("loginForm");

const API_URL = "http://127.0.0.1:8000";


// =========================================================
// NORMAL EMAIL LOGIN
// =========================================================

if (form) {

    form.addEventListener("submit", async (e) => {

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

                alert(
                    data.detail ||
                    "Login failed."
                );

                return;
            }


            // =================================================
            // SAVE AUTHENTICATION
            // =================================================

            localStorage.setItem(
                "access_token",
                data.access_token
            );


            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // =================================================
            // GO TO DASHBOARD
            // =================================================

            console.log(
                "LOGIN SUCCESS → DASHBOARD"
            );


            window.location.replace(
                "dashboard.html"
            );

        }

        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            alert(
                "Cannot connect to backend."
            );

        }

    });

}


// =========================================================
// GOOGLE LOGIN
// =========================================================

function handleGoogleLogin(response) {

    console.log(
        "Google credential received"
    );


    if (
        !response ||
        !response.credential
    ) {

        alert(
            "Google login failed."
        );

        return;
    }


    loginWithGoogle(
        response.credential
    );

}


// =========================================================
// GOOGLE BACKEND LOGIN
// =========================================================

async function loginWithGoogle(
    credential
) {

    try {

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


        const data =
            await response.json();


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


        // =================================================
        // SAVE JWT
        // =================================================

        localStorage.setItem(
            "access_token",
            data.access_token
        );


        // =================================================
        // SAVE USER
        // =================================================

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        // =================================================
        // GO TO DASHBOARD
        // =================================================

        console.log(
            "GOOGLE LOGIN SUCCESS → DASHBOARD"
        );


        window.location.replace(
            "dashboard.html"
        );

    }

    catch (error) {

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
// INITIALIZE GOOGLE SIGN-IN
// =========================================================

function initializeGoogleLogin() {

    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.id
    ) {

        console.log(
            "Google Identity Services not loaded yet."
        );

        setTimeout(
            initializeGoogleLogin,
            500
        );

        return;
    }


    const googleButton =
        document.getElementById(
            "googleButton"
        );


    if (!googleButton) {

        console.warn(
            "Google button not found."
        );

        return;
    }


    google.accounts.id.initialize({

        client_id:
            "221221986548-23g9vo9mm06mtuo6hhohsmg8ujseudh5.apps.googleusercontent.com",

        callback:
            handleGoogleLogin

    });


    google.accounts.id.renderButton(

        googleButton,

        {
            theme: "outline",

            size: "large",

            width: 400,

            text: "continue_with",

            shape: "rectangular"
        }

    );


    console.log(
        "Google Login initialized."
    );

}


// =========================================================
// START GOOGLE LOGIN
// =========================================================

window.addEventListener(
    "load",
    initializeGoogleLogin
);