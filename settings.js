"use strict";

// ============================================================
// AI CODE TUTOR STUDIO
// settings.js
// ============================================================

const API_URL = "http://127.0.0.1:8000";


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("====================================");
    console.log("SETTINGS PAGE");
    console.log("Settings JS Loaded");
    console.log("====================================");

    initializeSettings();

});


// ============================================================
// INITIALIZE SETTINGS
// ============================================================

async function initializeSettings() {

    const token =
        localStorage.getItem("access_token");


    // --------------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------------

    if (!token) {

        console.warn(
            "No access token found."
        );

        redirectToLogin();

        return;

    }


    // --------------------------------------------------------
    // LOAD USER
    // --------------------------------------------------------

    const userLoaded =
        await loadUser();


    if (!userLoaded) {

        return;

    }


    // --------------------------------------------------------
    // LOAD LOCAL SETTINGS
    // --------------------------------------------------------

    loadSettings();


    // --------------------------------------------------------
    // LOAD NOTIFICATIONS FROM MONGODB
    // --------------------------------------------------------

    await loadNotifications();


    // --------------------------------------------------------
    // SETUP CONTROLS
    // --------------------------------------------------------

    setupSettings();


    // --------------------------------------------------------
    // SETUP LOGOUT
    // --------------------------------------------------------

    setupLogout();


    console.log(
        "SETTINGS INITIALIZATION COMPLETE"
    );

}


// ============================================================
// LOAD AUTHENTICATED USER
// ============================================================

async function loadUser() {

    const token =
        localStorage.getItem("access_token");


    if (!token) {

        redirectToLogin();

        return false;

    }


    try {

        console.log(
            "Loading authenticated user..."
        );


        const response =
            await fetch(
                `${API_URL}/auth/me`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        console.log(
            "AUTH ME STATUS:",
            response.status
        );


        // ----------------------------------------------------
        // TOKEN EXPIRED
        // ----------------------------------------------------

        if (response.status === 401) {

            console.warn(
                "Authentication expired."
            );

            logout();

            return false;

        }


        // ----------------------------------------------------
        // OTHER ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "AUTH ME ERROR:",
                response.status,
                errorText
            );

            return false;

        }


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        const data =
            await response.json();


        console.log(
            "USER FROM MONGODB:",
            data
        );


        const user =
            data.user;


        if (!user) {

            console.warn(
                "No user returned from /auth/me"
            );

            return false;

        }


        // ----------------------------------------------------
        // DISPLAY USER
        // ----------------------------------------------------

        displayUser(user);


        // ----------------------------------------------------
        // CACHE USER
        // ----------------------------------------------------

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );


        return true;

    }

    catch (error) {

        console.error(
            "LOAD USER ERROR:",
            error
        );

        return false;

    }

}


// ============================================================
// DISPLAY USER
// ============================================================

function displayUser(user) {

    if (!user) return;


    // --------------------------------------------------------
    // NAME
    // --------------------------------------------------------

    const name =
        user.name ||
        user.username ||
        user.full_name ||
        "Developer";


    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    const email =
        user.email ||
        user.email_address ||
        "";


    console.log(
        "USER NAME:",
        name
    );


    console.log(
        "USER EMAIL:",
        email
    );


    // --------------------------------------------------------
    // HEADER NAME
    // --------------------------------------------------------

    const headerName =
        document.getElementById(
            "headerUserName"
        );


    if (headerName) {

        headerName.textContent =
            name;

    }


    // --------------------------------------------------------
    // HEADER EMAIL
    // --------------------------------------------------------

    const headerEmail =
        document.getElementById(
            "headerUserEmail"
        );


    if (headerEmail) {

        headerEmail.textContent =
            email;

    }


    // --------------------------------------------------------
    // PROFILE NAME
    // --------------------------------------------------------

    const profileName =
        document.getElementById(
            "profileName"
        );


    if (profileName) {

        profileName.value =
            name;

    }


    // --------------------------------------------------------
    // PROFILE EMAIL
    // --------------------------------------------------------

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );


    if (profileEmail) {

        profileEmail.value =
            email;

    }


    // --------------------------------------------------------
    // AVATAR LETTER
    // --------------------------------------------------------

    const firstLetter =
        name
            .trim()
            .charAt(0)
            .toUpperCase();


    // --------------------------------------------------------
    // HEADER AVATAR
    // --------------------------------------------------------

    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


    if (userAvatar) {

        userAvatar.textContent =
            firstLetter;

    }


    // --------------------------------------------------------
    // PROFILE AVATAR
    // --------------------------------------------------------

    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    if (profileAvatar) {

        profileAvatar.textContent =
            firstLetter;

    }

}


// ============================================================
// LOAD LOCAL SETTINGS
// ============================================================

function loadSettings() {

    const saved =
        localStorage.getItem(
            "codeTutorSettings"
        );


    if (!saved) {

        console.log(
            "No local settings found."
        );

        return;

    }


    try {

        const settings =
            JSON.parse(saved);


        Object.keys(settings).forEach(
            key => {

                const element =
                    document.getElementById(
                        key
                    );


                if (!element) {

                    return;

                }


                // ------------------------------------------------
                // CHECKBOX
                // ------------------------------------------------

                if (
                    element.type ===
                    "checkbox"
                ) {

                    element.checked =
                        Boolean(
                            settings[key]
                        );

                }


                // ------------------------------------------------
                // SELECT
                // ------------------------------------------------

                else {

                    element.value =
                        settings[key];

                }

            }
        );


        console.log(
            "LOCAL SETTINGS LOADED:",
            settings
        );

    }

    catch (error) {

        console.error(
            "SETTINGS LOAD ERROR:",
            error
        );

    }

}


// ============================================================
// LOAD NOTIFICATIONS FROM BACKEND
// ============================================================

async function loadNotifications() {

    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        redirectToLogin();

        return false;

    }


    try {

        console.log(
            "Loading notification settings..."
        );


        const response =
            await fetch(
                `${API_URL}/auth/notifications`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        console.log(
            "NOTIFICATIONS GET STATUS:",
            response.status
        );


        // ----------------------------------------------------
        // TOKEN EXPIRED
        // ----------------------------------------------------

        if (response.status === 401) {

            console.warn(
                "Notification request unauthorized."
            );

            logout();

            return false;

        }


        // ----------------------------------------------------
        // ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "NOTIFICATION LOAD ERROR:",
                response.status,
                errorText
            );

            return false;

        }


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        const data =
            await response.json();


        console.log(
            "NOTIFICATIONS FROM MONGODB:",
            data
        );


        /*
         * Supports either:
         *
         * {
         *     "notifications": {
         *         ...
         *     }
         * }
         *
         * OR
         *
         * {
         *     "user": {
         *         "notifications": {
         *             ...
         *         }
         *     }
         * }
         *
         * OR direct notification object.
         */

        const notifications =
            data.notifications ||
            (data.user &&
                data.user.notifications) ||
            data;


        // ----------------------------------------------------
        // APPLY TO UI
        // ----------------------------------------------------

        applyNotificationSettings(
            notifications
        );


        return true;

    }

    catch (error) {

        console.error(
            "LOAD NOTIFICATIONS ERROR:",
            error
        );

        return false;

    }

}


// ============================================================
// APPLY NOTIFICATION SETTINGS TO UI
// ============================================================

function applyNotificationSettings(
    notifications
) {

    if (!notifications) {

        console.warn(
            "No notification settings returned."
        );

        return;

    }


    console.log(
        "APPLYING NOTIFICATIONS:",
        notifications
    );


    // ========================================================
    // LEARNING REMINDERS
    // ========================================================

    setCheckbox(
        "learningNotifications",
        notifications.learningNotifications
    );


    // ========================================================
    // AI NOTIFICATIONS
    // ========================================================

    setCheckbox(
        "aiNotifications",
        notifications.aiNotifications
    );
    // ========================================================
    // EMAIL NOTIFICATIONS
    // ========================================================

    setCheckbox(
        "emailNotifications",
        notifications.emailNotifications
    );


    console.log(
        "NOTIFICATION UI UPDATED"
    );

}


// ============================================================
// SET CHECKBOX SAFELY
// ============================================================

function setCheckbox(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {

        console.warn(
            `Checkbox not found: ${id}`
        );

        return;

    }


    if (
        typeof value ===
        "undefined"
    ) {

        return;

    }


    element.checked =
        Boolean(value);

}


// ============================================================
// SETUP SETTINGS CONTROLS
// ============================================================

function setupSettings() {

    // --------------------------------------------------------
    // SELECTS
    // --------------------------------------------------------

    document
        .querySelectorAll("select")
        .forEach(
            select => {

                // Prevent duplicate listeners
                select.removeEventListener(
                    "change",
                    saveSettings
                );

                select.addEventListener(
                    "change",
                    saveSettings
                );

            }
        );


    // --------------------------------------------------------
    // ALL CHECKBOXES
    // --------------------------------------------------------

    document
        .querySelectorAll(
            "input[type='checkbox']"
        )
        .forEach(
            checkbox => {

                checkbox.removeEventListener(
                    "change",
                    handleCheckboxChange
                );

                checkbox.addEventListener(
                    "change",
                    handleCheckboxChange
                );

            }
        );


    // --------------------------------------------------------
    // SAVE PROFILE
    // --------------------------------------------------------

    const saveProfileBtn =
        document.getElementById(
            "saveProfileBtn"
        );


    if (saveProfileBtn) {

        saveProfileBtn.removeEventListener(
            "click",
            saveProfileName
        );

        saveProfileBtn.addEventListener(
            "click",
            saveProfileName
        );

    }


    // --------------------------------------------------------
    // CHANGE PASSWORD
    // --------------------------------------------------------

    const changePasswordBtn =
        document.getElementById(
            "changePasswordBtn"
        );


    if (changePasswordBtn) {

        changePasswordBtn.addEventListener(
            "click",
            () => {

                alert(
                    "Password change will be added next."
                );

            }
        );

    }


    console.log(
        "SETTINGS CONTROLS READY"
    );

}


// ============================================================
// HANDLE CHECKBOX CHANGE
// ============================================================

function handleCheckboxChange(
    event
) {

    const checkbox =
        event.currentTarget;


    if (!checkbox) return;


    const id =
        checkbox.id;


    console.log(
        "CHECKBOX CHANGED:",
        id,
        checkbox.checked
    );


    // --------------------------------------------------------
    // NOTIFICATION CHECKBOX
    // --------------------------------------------------------

    if (
        isNotificationCheckbox(id)
    ) {

        saveNotificationSettings();

        return;

    }


    // --------------------------------------------------------
    // NORMAL LOCAL SETTING
    // --------------------------------------------------------

    saveSettings();

}


// ============================================================
// CHECK IF NOTIFICATION CHECKBOX
// ============================================================

function isNotificationCheckbox(
    id
) {

    return [

        "learningNotifications",

        "aiNotifications",

        "projectNotifications",

        "emailNotifications"

    ].includes(id);

}


// ============================================================
// SAVE LOCAL SETTINGS
// ============================================================

function saveSettings() {

    const settings = {};


    // --------------------------------------------------------
    // SELECTS
    // --------------------------------------------------------

    document
        .querySelectorAll("select")
        .forEach(
            element => {

                if (!element.id) {

                    return;

                }


                settings[element.id] =
                    element.value;

            }
        );


    // --------------------------------------------------------
    // NON-NOTIFICATION CHECKBOXES
    // --------------------------------------------------------

    document
        .querySelectorAll(
            "input[type='checkbox']"
        )
        .forEach(
            element => {

                if (!element.id) {

                    return;

                }


                // Notification settings
                // are saved in MongoDB.
                if (
                    isNotificationCheckbox(
                        element.id
                    )
                ) {

                    return;

                }


                settings[element.id] =
                    element.checked;

            }
        );


    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    localStorage.setItem(
        "codeTutorSettings",
        JSON.stringify(settings)
    );


    console.log(
        "LOCAL SETTINGS SAVED:",
        settings
    );

}


// ============================================================
// SAVE NOTIFICATION SETTINGS
// ============================================================

async function saveNotificationSettings() {

    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        redirectToLogin();

        return false;

    }


    // --------------------------------------------------------
    // GET CHECKBOXES
    // --------------------------------------------------------

    const learning =
        getCheckboxValue(
            "learningNotifications"
        );


    const ai =
        getCheckboxValue(
            "aiNotifications"
        );


    const project =
        getCheckboxValue(
            "projectNotifications"
        );


    const email =
        getCheckboxValue(
            "emailNotifications"
        );


    // --------------------------------------------------------
    // DATA
    // --------------------------------------------------------

    const notificationData = {

        learningNotifications:
            learning,

        aiNotifications:
            ai,

        projectNotifications:
            project,

        emailNotifications:
            email

    };


    console.log(
        "SAVING NOTIFICATIONS:",
        notificationData
    );


    try {

        const response =
            await fetch(
                `${API_URL}/auth/notifications`,
                {

                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            notificationData
                        )

                }
            );


        console.log(
            "NOTIFICATIONS PUT STATUS:",
            response.status
        );


        // ----------------------------------------------------
        // READ RESPONSE
        // ----------------------------------------------------

        let data = {};

        try {

            data =
                await response.json();

        }

        catch {

            data = {};

        }


        console.log(
            "NOTIFICATIONS PUT RESPONSE:",
            data
        );


        // ----------------------------------------------------
        // AUTH ERROR
        // ----------------------------------------------------

        if (
            response.status ===
            401
        ) {

            console.warn(
                "Notification update unauthorized."
            );

            logout();

            return false;

        }


        // ----------------------------------------------------
        // OTHER ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            console.error(
                "NOTIFICATION UPDATE FAILED:",
                data
            );


            alert(
                data.detail ||
                "Unable to save notification settings."
            );


            return false;

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        console.log(
            "NOTIFICATION SETTINGS SAVED TO MONGODB"
        );


        return true;

    }

    catch (error) {

        console.error(
            "NOTIFICATION SAVE ERROR:",
            error
        );


        alert(
            "Unable to connect to backend."
        );


        return false;

    }

}


// ============================================================
// GET CHECKBOX VALUE
// ============================================================

function getCheckboxValue(
    id
) {

    const element =
        document.getElementById(id);


    if (!element) {

        console.warn(
            `Checkbox not found: ${id}`
        );

        return false;

    }


    return element.checked;

}


// ============================================================
// SAVE PROFILE NAME
// ============================================================

async function saveProfileName() {

    const input =
        document.getElementById(
            "profileName"
        );


    // --------------------------------------------------------
    // PROFILE INPUT NOT FOUND
    // --------------------------------------------------------

    if (!input) {

        console.error(
            "profileName input not found."
        );

        alert(
            "Profile name field was not found."
        );

        return;

    }


    const name =
        input.value.trim();


    // --------------------------------------------------------
    // EMPTY NAME
    // --------------------------------------------------------

    if (!name) {

        alert(
            "Please enter your name."
        );

        return;

    }


    const token =
        localStorage.getItem(
            "access_token"
        );


    // --------------------------------------------------------
    // LOGIN CHECK
    // --------------------------------------------------------

    if (!token) {

        redirectToLogin();

        return;

    }


    console.log(
        "SAVING PROFILE NAME:",
        name
    );


    try {

        const response =
            await fetch(
                `${API_URL}/auth/profile`,
                {

                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            name:
                                name

                        })

                }
            );


        console.log(
            "PROFILE PUT STATUS:",
            response.status
        );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        let data = {};

        try {

            data =
                await response.json();

        }

        catch {

            data = {};

        }


        console.log(
            "PROFILE RESPONSE:",
            data
        );


        // ----------------------------------------------------
        // AUTH ERROR
        // ----------------------------------------------------

        if (
            response.status ===
            401
        ) {

            console.warn(
                "Profile update unauthorized."
            );

            logout();

            return;

        }


        // ----------------------------------------------------
        // OTHER ERROR
        // ----------------------------------------------------

        if (!response.ok) {

            console.error(
                "PROFILE UPDATE FAILED:",
                data
            );


            alert(
                data.detail ||
                "Unable to save profile."
            );


            return;

        }


        // ----------------------------------------------------
        // UPDATED USER
        // ----------------------------------------------------

        const updatedUser =
            data.user;


        if (updatedUser) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    updatedUser
                )
            );


            displayUser(
                updatedUser
            );

        }

        else {

            // Fallback
            updateProfileUI(
                name
            );

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        console.log(
            "PROFILE UPDATED IN MONGODB"
        );


        alert(
            "Profile saved successfully."
        );

    }

    catch (error) {

        console.error(
            "PROFILE UPDATE ERROR:",
            error
        );


        alert(
            "Unable to connect to backend."
        );

    }

}


// ============================================================
// UPDATE PROFILE UI
// ============================================================

function updateProfileUI(
    name
) {

    // --------------------------------------------------------
    // HEADER NAME
    // --------------------------------------------------------

    const headerName =
        document.getElementById(
            "headerUserName"
        );


    if (headerName) {

        headerName.textContent =
            name;

    }


    // --------------------------------------------------------
    // PROFILE INPUT
    // --------------------------------------------------------

    const profileName =
        document.getElementById(
            "profileName"
        );


    if (profileName) {

        profileName.value =
            name;

    }


    // --------------------------------------------------------
    // AVATAR
    // --------------------------------------------------------

    const letter =
        name
            .trim()
            .charAt(0)
            .toUpperCase();


    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    if (userAvatar) {

        userAvatar.textContent =
            letter;

    }


    if (profileAvatar) {

        profileAvatar.textContent =
            letter;

    }

}


// ============================================================
// SETUP LOGOUT
// ============================================================

function setupLogout() {

    const button =
        document.getElementById(
            "logoutBtn"
        );


    if (!button) {

        console.warn(
            "Logout button not found."
        );

        return;

    }


    button.removeEventListener(
        "click",
        logout
    );


    button.addEventListener(
        "click",
        logout
    );


    console.log(
        "LOGOUT READY"
    );

}


// ============================================================
// LOGOUT
// ============================================================

function logout() {

    console.log(
        "Logging out..."
    );


    // --------------------------------------------------------
    // REMOVE AUTH
    // --------------------------------------------------------

    localStorage.removeItem(
        "access_token"
    );


    localStorage.removeItem(
        "user"
    );


    localStorage.removeItem(
        "current_user_name"
    );


    // --------------------------------------------------------
    // KEEP USER SETTINGS
    // --------------------------------------------------------
    //
    // codeTutorSettings is intentionally NOT removed.
    //
    // Notification settings are stored in MongoDB.
    //
    // --------------------------------------------------------


    sessionStorage.clear();


    // --------------------------------------------------------
    // LOGIN
    // --------------------------------------------------------

    window.location.replace(
        "login.html"
    );

}


// ============================================================
// REDIRECT TO LOGIN
// ============================================================

function redirectToLogin() {

    window.location.replace(
        "login.html"
    );

}


// ============================================================
// GLOBAL EXPORT
// ============================================================

window.settings = {

    loadUser,

    loadSettings,

    loadNotifications,

    saveSettings,

    saveNotificationSettings,

    saveProfileName,

    logout

};


console.log(
    "settings.js loaded successfully."
);