// =========================================================
// LOGIN.JS
// AI CODE TUTOR STUDIO
// =========================================================

"use strict";


// =========================================================
// CONFIG
// =========================================================

const API_URL =
    "https://ai-code-tutor-studio.onrender.com";

const GOOGLE_CLIENT_ID =
    "221221986548-23g9vo9mm06mtuo6hhohsmg8ujseudh5.apps.googleusercontent.com";


// =========================================================
// EMAIL LOGIN
// =========================================================

const form =
    document.getElementById("loginForm");


if (form) {

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const email =
            document.getElementById("email")
                .value
                .trim();

        const password =
            document.getElementById("password")
                .value
                .trim();


        if (!email || !password) {

            alert(
                "Please enter email and password."
            );

            return;
        }


        try {

            console.log(
                "EMAIL LOGIN → BACKEND"
            );


            const response =
                await fetch(
                    `${API_URL}/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            console.log(
                "EMAIL LOGIN RESPONSE:",
                data
            );


            if (!response.ok) {

                alert(
                    data.detail ||
                    "Login failed."
                );

                return;
            }


            // SAVE TOKEN

            localStorage.setItem(
                "access_token",
                data.access_token
            );


            // SAVE USER

            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );


            console.log(
                "EMAIL LOGIN SUCCESS"
            );


            // IMPORTANT:
            // login.html is inside auth folder
            // dashboard.html is inside dashboard folder

            window.location.href =
                "../dashboard/dashboard.html";

        }

        catch (error) {

            console.error(
                "EMAIL LOGIN ERROR:",
                error
            );

            alert(
                "Cannot connect to backend."
            );

        }

    });

}


// =========================================================
// GOOGLE LOGIN CALLBACK
// =========================================================

function handleGoogleLogin(response) {

    console.log(
        "GOOGLE CREDENTIAL RECEIVED"
    );


    if (
        !response ||
        !response.credential
    ) {

        console.error(
            "Google credential missing",
            response
        );

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
// SEND GOOGLE CREDENTIAL TO RENDER
// =========================================================

async function loginWithGoogle(
    credential
) {

    try {

        console.log(
            "Sending Google credential to Render..."
        );


        const response =
            await fetch(
                `${API_URL}/auth/google`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        credential:
                            credential
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "GOOGLE BACKEND RESPONSE:",
            data
        );


        if (!response.ok) {

            console.error(
                "GOOGLE BACKEND ERROR:",
                data
            );


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
            JSON.stringify(
                data.user
            )
        );


        console.log(
            "GOOGLE LOGIN SUCCESS"
        );


        // =================================================
        // GO TO DASHBOARD
        // =================================================

        window.location.href =
            "../dashboard/dashboard.html";

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
// INITIALIZE GOOGLE IDENTITY SERVICES
// =========================================================

function initializeGoogleLogin() {

    console.log(
        "Initializing Google Login..."
    );


    if (
        typeof google === "undefined" ||
        !google.accounts ||
        !google.accounts.id
    ) {

        console.log(
            "Google Identity Services not ready..."
        );


        setTimeout(
            initializeGoogleLogin,
            500
        );


        return;
    }


    const googleButton =
        document.getElementById(
            "customGoogleButton"
        );


    if (!googleButton) {

        console.error(
            "Custom Google button not found."
        );

        return;
    }


    // =====================================================
    // INITIALIZE GOOGLE
    // =====================================================

    google.accounts.id.initialize({

        client_id:
            GOOGLE_CLIENT_ID,

        callback:
            handleGoogleLogin,

        auto_select:
            false,

        cancel_on_tap_outside:
            true

    });


    console.log(
        "Google Identity Services initialized."
    );


    // =====================================================
    // CUSTOM BUTTON CLICK
    // =====================================================

    googleButton.addEventListener(
        "click",
        function () {

            console.log(
                "CUSTOM GOOGLE BUTTON CLICKED"
            );


            // Open Google's authentication UI

            google.accounts.id.prompt(
                function (notification) {

                    console.log(
                        "Google prompt notification:",
                        notification
                    );


                    if (
                        notification.isNotDisplayed()
                    ) {

                        console.warn(
                            "Google prompt was not displayed."
                        );

                    }


                    if (
                        notification.isSkippedMoment()
                    ) {

                        console.warn(
                            "Google prompt was skipped."
                        );

                    }

                }
            );

        }
    );


    console.log(
        "Custom Google button ready."
    );

}


// =========================================================
// WAIT FOR GOOGLE SCRIPT
// =========================================================

window.addEventListener(
    "load",
    function () {

        initializeGoogleLogin();

    }
);
