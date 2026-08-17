
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
// DASHBOARD PATH
// =========================================================
//
// Your project is using:
//
// /dashboard/dashboard.html
//
// Therefore we use an absolute Vercel path.
//
// =========================================================

const DASHBOARD_URL =
    "/dashboard/dashboard.html";


// =========================================================
// LOGIN FORM
// =========================================================

const form =
    document.getElementById("loginForm");


// =========================================================
// NORMAL EMAIL LOGIN
// =========================================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            console.log(
                "===================================="
            );

            console.log(
                "EMAIL LOGIN STARTED"
            );

            console.log(
                "===================================="
            );


            // -------------------------------------------------
            // GET INPUTS
            // -------------------------------------------------

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");


            if (
                !emailInput ||
                !passwordInput
            ) {

                console.error(
                    "Login inputs not found."
                );

                alert(
                    "Login form is not configured correctly."
                );

                return;
            }


            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value.trim();


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

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


            // -------------------------------------------------
            // LOGIN BUTTON
            // -------------------------------------------------

            const loginButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            let originalButtonText =
                "Login";


            if (loginButton) {

                originalButtonText =
                    loginButton.textContent;

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Signing in...";
            }


            try {

                // -------------------------------------------------
                // SEND LOGIN REQUEST
                // -------------------------------------------------

                console.log(
                    "Backend:",
                    API_URL
                );


                const response =
                    await fetch(
                        `${API_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email:
                                    email,

                                password:
                                    password
                            })
                        }
                    );


                console.log(
                    "Backend status:",
                    response.status
                );


                // -------------------------------------------------
                // READ RESPONSE
                // -------------------------------------------------

                let data = {};


                try {

                    data =
                        await response.json();

                }

                catch (jsonError) {

                    console.error(
                        "Response JSON error:",
                        jsonError
                    );

                    data = {};
                }


                console.log(
                    "Backend response:",
                    data
                );


                // -------------------------------------------------
                // LOGIN FAILED
                // -------------------------------------------------

                if (!response.ok) {

                    alert(
                        data.detail ||
                        data.message ||
                        "Login failed."
                    );

                    return;
                }


                // -------------------------------------------------
                // CHECK TOKEN
                // -------------------------------------------------

                if (
                    !data.access_token
                ) {

                    console.error(
                        "No access token returned."
                    );

                    alert(
                        "Login succeeded but authentication token was not received."
                    );

                    return;
                }


                // -------------------------------------------------
                // CHECK USER
                // -------------------------------------------------

                if (!data.user) {

                    console.error(
                        "No user returned."
                    );

                    alert(
                        "Login succeeded but user information was not received."
                    );

                    return;
                }


                // =================================================
                // SAVE TOKEN
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


                // Remove old token name if present

                localStorage.removeItem(
                    "token"
                );


                // =================================================
                // VERIFY STORAGE
                // =================================================

                const savedToken =
                    localStorage.getItem(
                        "access_token"
                    );


                if (!savedToken) {

                    console.error(
                        "Token was not saved."
                    );

                    alert(
                        "Login completed, but the session could not be saved."
                    );

                    return;
                }


                // =================================================
                // LOGIN SUCCESS
                // =================================================

                console.log(
                    "===================================="
                );

                console.log(
                    "LOGIN SUCCESS"
                );

                console.log(
                    "USER:",
                    data.user
                );

                console.log(
                    "TOKEN SAVED:",
                    true
                );

                console.log(
                    "REDIRECT:",
                    DASHBOARD_URL
                );

                console.log(
                    "===================================="
                );


                // =================================================
                // REDIRECT TO DASHBOARD
                // =================================================

                window.location.href =
                    DASHBOARD_URL;

            }

            catch (error) {

                console.error(
                    "===================================="
                );

                console.error(
                    "LOGIN ERROR"
                );

                console.error(
                    error
                );

                console.error(
                    "===================================="
                );


                alert(
                    "Unable to connect to the authentication server."
                );
            }


            finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        originalButtonText;
                }
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
        "===================================="
    );

    console.log(
        "GOOGLE LOGIN CALLBACK"
    );

    console.log(
        "===================================="
    );


    if (
        !response ||
        !response.credential
    ) {

        console.error(
            "Google credential missing:",
            response
        );

        alert(
            "Google login failed."
        );

        return;
    }


    console.log(
        "Google credential received."
    );


    loginWithGoogle(
        response.credential
    );
}


// =========================================================
// GOOGLE LOGIN → BACKEND
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
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({
                        credential:
                            credential
                    })
                }
            );


        console.log(
            "Google backend status:",
            response.status
        );


        // -------------------------------------------------
        // READ RESPONSE
        // -------------------------------------------------

        let data = {};


        try {

            data =
                await response.json();

        }

        catch (error) {

            console.error(
                "Google response JSON error:",
                error
            );
        }


        console.log(
            "Google backend response:",
            data
        );


        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        if (!response.ok) {

            console.error(
                "Google authentication failed:",
                data
            );

            alert(
                data.detail ||
                data.message ||
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
                "Google login returned no token."
            );

            alert(
                "Google login succeeded, but authentication token was not returned."
            );

            return;
        }


        // -------------------------------------------------
        // USER CHECK
        // -------------------------------------------------

        if (!data.user) {

            console.error(
                "Google login returned no user."
            );

            alert(
                "Google login succeeded, but user information was not returned."
            );

            return;
        }


        // =================================================
        // SAVE GOOGLE TOKEN
        // =================================================

        localStorage.setItem(
            "access_token",
            data.access_token
        );


        // =================================================
        // SAVE GOOGLE USER
        // =================================================

        localStorage.setItem(
            "user",
            JSON.stringify(
                data.user
            )
        );


        // Remove old token

        localStorage.removeItem(
            "token"
        );


        // =================================================
        // VERIFY TOKEN
        // =================================================

        const savedToken =
            localStorage.getItem(
                "access_token"
            );


        if (!savedToken) {

            console.error(
                "Google token was not saved."
            );

            alert(
                "Google login completed, but the session could not be saved."
            );

            return;
        }


        // =================================================
        // GOOGLE LOGIN SUCCESS
        // =================================================

        console.log(
            "===================================="
        );

        console.log(
            "GOOGLE LOGIN SUCCESS"
        );

        console.log(
            "USER:",
            data.user
        );

        console.log(
            "TOKEN SAVED:",
            true
        );

        console.log(
            "REDIRECT:",
            DASHBOARD_URL
        );

        console.log(
            "===================================="
        );


        // =================================================
        // REDIRECT
        // =================================================

        window.location.href =
            DASHBOARD_URL;

    }

    catch (error) {

        console.error(
            "===================================="
        );

        console.error(
            "GOOGLE LOGIN ERROR"
        );

        console.error(
            error
        );

        console.error(
            "===================================="
        );


        alert(
            "Unable to connect to the authentication server."
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
            "Google Identity Services not loaded yet..."
        );


        setTimeout(
            initializeGoogleLogin,
            500
        );


        return;
    }


    // -----------------------------------------------------
    // GET GOOGLE BUTTON
    // -----------------------------------------------------

    const googleButton =
        document.getElementById(
            "googleButton"
        );


    if (!googleButton) {

        console.warn(
            "Google button container not found."
        );

        return;
    }


    // -----------------------------------------------------
    // CLEAR BUTTON
    // -----------------------------------------------------

    googleButton.innerHTML =
        "";


    // -----------------------------------------------------
    // GOOGLE INITIALIZATION
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
    // RENDER GOOGLE BUTTON
    // -----------------------------------------------------

    google.accounts.id.renderButton(

        googleButton,

        {
            type:
                "standard",

            theme:
                "outline",

            size:
                "large",

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
        "Google Sign-In initialized."
    );
}


// =========================================================
// START GOOGLE LOGIN
// =========================================================

window.addEventListener(
    "load",
    function () {

        initializeGoogleLogin();

    }
);


// =========================================================
// DEBUG
// =========================================================

console.log(
    "===================================="
);

console.log(
    "AI CODE TUTOR STUDIO"
);

console.log(
    "LOGIN.JS LOADED"
);

console.log(
    "Backend:",
    API_URL
);

console.log(
    "Dashboard:",
    DASHBOARD_URL
);

console.log(
    "===================================="
);

