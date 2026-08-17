
// =========================================================
// LOGIN.JS
// AI CODE TUTOR STUDIO
// PRODUCTION VERSION
// =========================================================

"use strict";


// =========================================================
// CONFIGURATION
// =========================================================

const API_URL =
    "https://ai-code-tutor-studio.onrender.com";

const GOOGLE_CLIENT_ID =
    "221221986548-23g9vo9mm06mtuo6hhohsmg8ujseudh5.apps.googleusercontent.com";


// =========================================================
// DOM
// =========================================================

const form =
    document.getElementById("loginForm");

const googleButton =
    document.getElementById("googleButton");


// =========================================================
// DASHBOARD REDIRECT
// =========================================================

function goToDashboard() {

    console.log(
        "Redirecting to dashboard..."
    );

    /*
     * Login page:
     *
     * /auth/login.html
     *
     * Dashboard:
     *
     * /dashboard/dashboard.html
     */

    window.location.href =
        "dashboard.html";
}


// =========================================================
// SAVE AUTHENTICATION
// =========================================================

function saveAuthentication(data) {

    console.log(
        "Saving authentication..."
    );


    // -----------------------------------------------------
    // ACCESS TOKEN
    // -----------------------------------------------------

    if (
        !data ||
        !data.access_token
    ) {

        console.error(
            "Access token missing:",
            data
        );

        return false;
    }


    localStorage.setItem(
        "access_token",
        data.access_token
    );


    // -----------------------------------------------------
    // USER
    // -----------------------------------------------------

    if (data.user) {

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

    }


    // -----------------------------------------------------
    // VERIFY
    // -----------------------------------------------------

    const savedToken =
        localStorage.getItem(
            "access_token"
        );

    const savedUser =
        localStorage.getItem(
            "user"
        );


    console.log(
        "ACCESS TOKEN SAVED:",
        !!savedToken
    );

    console.log(
        "USER SAVED:",
        !!savedUser
    );


    if (!savedToken) {

        console.error(
            "Failed to save access token."
        );

        return false;
    }


    return true;
}


// =========================================================
// NORMAL EMAIL LOGIN
// =========================================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            console.log(
                "================================"
            );

            console.log(
                "EMAIL LOGIN STARTED"
            );

            console.log(
                "================================"
            );


            // ------------------------------------------------
            // GET INPUT
            // ------------------------------------------------

            const emailInput =
                document.getElementById(
                    "email"
                );

            const passwordInput =
                document.getElementById(
                    "password"
                );


            if (
                !emailInput ||
                !passwordInput
            ) {

                console.error(
                    "Email or password input missing."
                );

                alert(
                    "Login form error."
                );

                return;
            }


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (!email) {

                alert(
                    "Please enter your email."
                );

                emailInput.focus();

                return;
            }


            if (!password) {

                alert(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;
            }


            // ------------------------------------------------
            // LOGIN
            // ------------------------------------------------

            try {

                console.log(
                    "Connecting to Render backend..."
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


                console.log(
                    "LOGIN STATUS:",
                    response.status
                );


                const rawResponse =
                    await response.text();


                console.log(
                    "LOGIN RAW RESPONSE:",
                    rawResponse
                );


                let data;

                try {

                    data =
                        JSON.parse(
                            rawResponse
                        );

                }

                catch (parseError) {

                    console.error(
                        "Invalid JSON from backend:",
                        parseError
                    );

                    alert(
                        "Backend returned an invalid response."
                    );

                    return;
                }


                // ------------------------------------------------
                // ERROR
                // ------------------------------------------------

                if (!response.ok) {

                    console.error(
                        "EMAIL LOGIN FAILED:",
                        data
                    );

                    alert(
                        data.detail ||
                        "Login failed."
                    );

                    return;
                }


                // ------------------------------------------------
                // SAVE AUTH
                // ------------------------------------------------

                const saved =
                    saveAuthentication(
                        data
                    );


                if (!saved) {

                    alert(
                        "Login succeeded, but authentication data could not be saved."
                    );

                    return;
                }


                console.log(
                    "EMAIL LOGIN SUCCESS"
                );


                // ------------------------------------------------
                // DASHBOARD
                // ------------------------------------------------

                goToDashboard();

            }

            catch (error) {

                console.error(
                    "EMAIL LOGIN ERROR:",
                    error
                );

                alert(
                    "Cannot connect to the backend."
                );
            }

        }
    );

}


// =========================================================
// GOOGLE LOGIN CALLBACK
// =========================================================

function handleGoogleLogin(
    response
) {

    console.log(
        "================================"
    );

    console.log(
        "GOOGLE CREDENTIAL RECEIVED"
    );

    console.log(
        "================================"
    );


    // -----------------------------------------------------
    // VALIDATE RESPONSE
    // -----------------------------------------------------

    if (
        !response ||
        !response.credential
    ) {

        console.error(
            "Google credential missing:",
            response
        );

        alert(
            "Google login failed. Credential missing."
        );

        return;
    }


    console.log(
        "Google credential received successfully."
    );


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

    console.log(
        "================================"
    );

    console.log(
        "GOOGLE BACKEND LOGIN STARTED"
    );

    console.log(
        "================================"
    );


    try {

        // -------------------------------------------------
        // SEND GOOGLE TOKEN TO RENDER
        // -------------------------------------------------

        console.log(
            "Sending Google credential to:"
        );

        console.log(
            `${API_URL}/auth/google`
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


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        console.log(
            "GOOGLE BACKEND STATUS:",
            response.status
        );


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        const rawResponse =
            await response.text();


        console.log(
            "GOOGLE BACKEND RAW RESPONSE:",
            rawResponse
        );


        let data;

        try {

            data =
                JSON.parse(
                    rawResponse
                );

        }

        catch (parseError) {

            console.error(
                "Could not parse Google backend response:",
                parseError
            );

            alert(
                "Authentication server returned an invalid response."
            );

            return;
        }


        console.log(
            "GOOGLE BACKEND DATA:",
            data
        );


        // -------------------------------------------------
        // BACKEND ERROR
        // -------------------------------------------------

        if (!response.ok) {

            console.error(
                "GOOGLE LOGIN FAILED:",
                data
            );


            alert(
                data.detail ||
                "Google login failed."
            );

            return;
        }


        // -------------------------------------------------
        // TOKEN CHECK
        // -------------------------------------------------

        if (
            !data.access_token
        ) {

            console.error(
                "Backend did not return access token:",
                data
            );


            alert(
                "Google login succeeded, but no access token was returned."
            );

            return;
        }


        // -------------------------------------------------
        // SAVE AUTHENTICATION
        // -------------------------------------------------

        const saved =
            saveAuthentication(
                data
            );


        if (!saved) {

            alert(
                "Google login succeeded, but authentication could not be saved."
            );

            return;
        }


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        console.log(
            "================================"
        );

        console.log(
            "GOOGLE LOGIN SUCCESS"
        );

        console.log(
            "================================"
        );


        // -------------------------------------------------
        // REDIRECT
        // -------------------------------------------------

        goToDashboard();

    }

    catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "GOOGLE LOGIN ERROR:",
            error
        );

        console.error(
            "================================"
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

    console.log(
        "Initializing Google Sign-In..."
    );


    // -----------------------------------------------------
    // CHECK GOOGLE SDK
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // CHECK BUTTON
    // -----------------------------------------------------

    const button =
        document.getElementById(
            "googleButton"
        );


    if (!button) {

        console.error(
            "Google button container not found."
        );

        return;
    }


    // -----------------------------------------------------
    // CLEAR OLD BUTTON
    // -----------------------------------------------------

    button.innerHTML = "";


    // -----------------------------------------------------
    // INITIALIZE GOOGLE
    // -----------------------------------------------------

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


    // -----------------------------------------------------
    // RENDER STANDARD GOOGLE BUTTON
    // -----------------------------------------------------

    google.accounts.id.renderButton(

        button,

        {

            type:
                "standard",

            theme:
                "outline",

            /*
             * IMPORTANT
             *
             * medium prevents Google's
             * personalized account button.
             */

            size:
                "medium",

            width:
                400,

            text:
                "signin_with",

            shape:
                "rectangular",

            logo_alignment:
                "left"

        }

    );


    console.log(
        "Google Sign-In initialized successfully."
    );
}


// =========================================================
// WAIT FOR PAGE LOAD
// =========================================================

window.addEventListener(
    "load",
    function () {

        console.log(
            "Login page loaded."
        );


        initializeGoogleLogin();

    }
);
