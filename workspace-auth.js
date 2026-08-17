// ============================================================
// AI CODE TUTOR STUDIO
// workspace-auth.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Workspace Auth Connected");

    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    // ========================================================
    // PROTECT WORKSPACE
    // ========================================================

    if (!token) {

        console.log("No login session found.");

        window.location.href = "login.html";

        return;
    }


    // ========================================================
    // GET USER
    // ========================================================

    let user = null;

    try {

        user = userData
            ? JSON.parse(userData)
            : null;

    } catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        localStorage.removeItem("user");

    }


    // ========================================================
    // DISPLAY USER NAME
    // ========================================================

    if (user) {

        console.log(
            "Logged in user:",
            user
        );


        // Try common user-name elements
        const userName =
            document.getElementById("userName") ||
            document.querySelector(".user-name") ||
            document.querySelector(".profile-name");


        if (userName) {

            userName.textContent =
                user.name || user.email;

        }

    }


    // ========================================================
    // LOGOUT
    // ========================================================

    const logoutBtn =
        document.getElementById("logoutBtn") ||
        document.querySelector(".logout-btn");


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                console.log(
                    "Logging out..."
                );


                localStorage.removeItem(
                    "access_token"
                );

                localStorage.removeItem(
                    "user"
                );


                window.location.href =
                    "login.html";

            }
        );

    }

});
