
// =========================================================
// LOGIN.JS
// AI CODE TUTOR STUDIO
// Production Version
// =========================================================

"use strict";

// =========================================================
// CONFIGURATION
// =========================================================

const API_URL = "https://ai-code-tutor-studio.onrender.com";

const GOOGLE_CLIENT_ID =
    "221221986548-23g9vo9mm06mtuo6hhohsmg8ujseudh5.apps.googleusercontent.com";


// =========================================================
// PAGE ELEMENTS
// =========================================================

const form = document.getElementById("loginForm");


// =========================================================
// NORMAL EMAIL LOGIN
// =========================================================

if (form) {

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        console.log("====================================");
        console.log("EMAIL LOGIN STARTED");
        console.log("====================================");


        // -------------------------------------------------
        // GET INPUTS
        // -------------------------------------------------

        const emailElement =
            document.getElementById("email");

        const passwordElement =
            document.getElementById("password");


        if (!emailElement || !passwordElement) {

            console.error(
                "Email or password input not found."
            );

            alert(
                "Login form is not configured correctly."
            );

            return;
        }


        const email =
            emailElement.value.trim();

        const password =
            passwordElement.value.trim();


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!email) {

            alert(
                "Please enter your email."
            );

            emailElement.focus();

            return;
        }


        if (!password) {

            alert(
                "Please enter your password."
            );

            passwordElement.focus();

            return;
        }


        // -------------------------------------------------
        // DISABLE BUTTON
        // -------------------------------------------------

        const loginButton =
            form.querySelector(
                'button[type="submit"]'
            );


        if (loginButton) {

            loginButton.disabled = true;

            loginButton.dataset.originalText =
                loginButton.textContent;

            loginButton.textContent =
                "Signing in...";
        }


        try {

            console.log(
                "Sending login request to:",
                `${API_URL}/auth/login`
            );


            // -------------------------------------------------
            // API REQUEST
            // -------------------------------------------------

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
                            email: email,
                            password: password
                        })
                    }
                );


            console.log(
                "Login response status:",
                response.status
            );


            // -------------------------------------------------
            // READ RESPONSE
            // -------------------------------------------------

            let data = {};

            try {

                data =
                    await response.json();

            } catch (jsonError) {

                console.error(
                    "Invalid JSON response:",
                    jsonError
                );

                data = {};
            }


            console.log(
                "Login backend response:",
                data
            );


            // -------------------------------------------------
            // LOGIN ERROR
            // -------------------------------------------------

            if (!response.ok) {

                const errorMessage =
                    data.detail ||
                    data.message ||
                    "Login failed.";

                console.error(
                    "LOGIN FAILED:",
                    errorMessage
                );

                alert(
                    errorMessage
                );

                return;
            }


            // -------------------------------------------------
            // CHECK TOKEN
            // -------------------------------------------------

            if (!data.access_token) {

                console.error(
                    "Backend did not return access_token.",
                    data
                );

                alert(
                    "Login succeeded, but authentication token was not received."
                );

                return;
            }


            // -------------------------------------------------
            // CHECK USER
            // -------------------------------------------------

            if (!data.user) {

                console.error(
                    "Backend did not return user information.",
                    data
                );

                alert(
                    "Login succeeded, but user information was not received."
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
                JSON.stringify(
                    data.user
                )
            );


            // Remove old token if it exists

            localStorage.removeItem(
                "token"
            );


            // Save current user name

            if (data.user.name) {

                localStorage.setItem(
                    "current_user_name",
                    data.user.name
                );
            }


            console.log(
                "Authentication saved."
            );

            console.log(
                "Token exists:",
                !!localStorage.getItem(
                    "access_token"
                )
            );

            console.log(
                "User:",
                data.user
            );


            // =================================================
            // VERIFY TOKEN WAS SAVED
            // =================================================

            const savedToken =
                localStorage.getItem(
                    "access_token"
                );


            if (!savedToken) {

                console.error(
                    "Token could not be saved to localStorage."
                );

                alert(
                    "Login completed, but session could not be saved."
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
                "User:",
                data.user
            );

            console.log(
                "Redirecting to dashboard..."
            );

            console.log(
                "===================================="
            );


            // =================================================
            // DASHBOARD
            // =================================================
            //
            // IMPORTANT:
            // dashboard.html is in the SAME folder
            // as login.html.
            //
            // Therefore:
            //
            // dashboard.html
            //
            // is the correct path.
            // =================================================

            window.location.replace(
                "dashboard.html"
            );

        }

        catch (error) {

            console.error(
                "===================================="
            );

            console.error(
                "LOGIN CONNECTION ERROR"
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

            // -------------------------------------------------
            // ENABLE BUTTON
            // -------------------------------------------------

            if (loginButton) {

                loginButton.disabled = false;

                loginButton.textContent =
                    loginButton.dataset.originalText ||
                    "Login";
            }
        }

    });
}


// =========================================================
// GOOGLE LOGIN CALLBACK
// =========================================================

function handleGoogleLogin(response) {

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
            "Google login failed. Credential was not received."
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
// GOOGLE BACKEND LOGIN
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

        } catch (error) {

            console.error(
                "Google response is not valid JSON:",
                error
            );

            data = {};
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

        if (!data.access_token) {

            console.error(
                "Google login did not return access token:",
                data
            );

            alert(
                "Google login succeeded, but no authentication token was returned."
            );

            return;
        }


        // -------------------------------------------------
        // USER CHECK
        // -------------------------------------------------

        if (!data.user) {

            console.error(
                "Google login did not return user:",
                data
            );

            alert(
                "Google login succeeded, but user information was not returned."
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


        // Remove old token

        localStorage.removeItem(
            "token"
        );


        // Save current name

        if (data.user.name) {

            localStorage.setItem(
                "current_user_name",
                data.user.name
            );
        }


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
                "Google login completed, but session could not be saved."
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
            "User:",
            data.user
        );

        console.log(
            "Redirecting to dashboard..."
        );

        console.log(
            "===================================="
        );


        // IMPORTANT:
        // dashboard.html is in the SAME folder.

        window.location.replace(
            "dashboard.html"
        );

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
            "Google Identity Services not loaded yet..."
        );


        setTimeout(
            initializeGoogleLogin,
            500
        );


        return;
    }


    // -----------------------------------------------------
    // GET BUTTON
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
    // CLEAR EXISTING BUTTON
    // -----------------------------------------------------

    googleButton.innerHTML = "";


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
        "Google Sign-In button initialized successfully."
    );
}


// =========================================================
// START GOOGLE LOGIN AFTER PAGE LOAD
// =========================================================

window.addEventListener(
    "load",
    function () {

        initializeGoogleLogin();

    }
);


// =========================================================
// DEBUG INFORMATION
// =========================================================

console.log(
    "===================================="
);

console.log(
    "AI CODE TUTOR STUDIO - LOGIN.JS"
);

console.log(
    "Login JS loaded successfully."
);

console.log(
    "Backend:",
    API_URL
);

console.log(
    "Dashboard:",
    "dashboard.html"
);

console.log(
    "===================================="
);

