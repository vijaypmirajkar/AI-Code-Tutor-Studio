// ============================================================
// AI CODE TUTOR STUDIO
// dashboard.js
// Dashboard + MongoDB Statistics
// ============================================================

"use strict";


// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = "https://ai-code-tutor-studio.onrender.com";


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("====================================");
    console.log("AI CODE TUTOR STUDIO");
    console.log("Dashboard JS Loaded");
    console.log("====================================");

    initializeDashboard();

});


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

function initializeDashboard() {

    const user = getLoggedInUser();

    if (!user) {

        console.warn("No logged-in user found.");

        redirectToLogin();

        return;

    }

    console.log("Logged in user:", user);

    displayUser(user);

    setupNavigation();

    setupNewProjectButton();

    setupContinueButtons();

    setupLogout();

    loadDashboardData();

}


// ============================================================
// GET LOGGED-IN USER
// ============================================================

function getLoggedInUser() {

    const token =
        localStorage.getItem("access_token");

    const storedUser =
        localStorage.getItem("user");


    if (!token) {

        console.warn(
            "Access token not found."
        );

        return null;

    }


    if (!storedUser) {

        console.warn(
            "User information not found."
        );

        return null;

    }


    try {

        return JSON.parse(storedUser);

    }

    catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        return null;

    }

}


// ============================================================
// DISPLAY USER
// ============================================================

function displayUser(user) {

    if (!user) return;


    const name =
        user.name ||
        user.username ||
        "Developer";


    const email =
        user.email ||
        "";


    document
        .querySelectorAll("[data-user-name]")
        .forEach(element => {

            element.textContent = name;

        });


    document
        .querySelectorAll("[data-user-email]")
        .forEach(element => {

            element.textContent = email;

        });


    const userName =
        document.getElementById("userName");


    if (userName) {

        userName.textContent = name;

    }


    const userEmail =
        document.getElementById("userEmail");


    if (userEmail) {

        userEmail.textContent = email;

    }


    localStorage.setItem(
        "current_user_name",
        name
    );

}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {


    // Dashboard

    document
        .querySelectorAll('[data-page="dashboard"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    window.location.href =
                        "dashboard.html";

                }
            );

        });


    // Workspace

    document
        .querySelectorAll('[data-page="workspace"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openWorkspace();

                }
            );

        });

    // History

    document
        .querySelectorAll('[data-page="history"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    window.location.href =
                        "history.html";

                }
            );

        });


    // Bookmarks

    document
        .querySelectorAll('[data-page="bookmarks"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    window.location.href =
                        "bookmarks.html";

                }
            );

        });


    // Settings

    document
        .querySelectorAll('[data-page="settings"]')
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    window.location.href =
                        "settings.html";

                }
            );

        });

}


// ============================================================
// NEW PROJECT BUTTON
// ============================================================

function setupNewProjectButton() {

    document
        .querySelectorAll(
            ".primary-btn, .new-project-btn, #newProjectBtn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openWorkspace();

                }
            );

        });

}


// ============================================================
// OPEN WORKSPACE
// ============================================================

function openWorkspace() {

    console.log(
        "Opening workspace..."
    );

    window.location.href =
        "workspace.html";

}


// ============================================================
// CONTINUE LEARNING
// ============================================================

function setupContinueButtons() {

    document
        .querySelectorAll(".continue-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openWorkspace();

                }
            );

        });

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    document
        .querySelectorAll(
            ".logout-btn, #logoutBtn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    logout();

                }
            );

        });

}


// ============================================================
// LOGOUT FUNCTION
// ============================================================

function logout() {

    console.log(
        "Logging out..."
    );


    localStorage.removeItem(
        "access_token"
    );

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "current_user_name"
    );


    sessionStorage.removeItem(
        "user"
    );

    sessionStorage.removeItem(
        "access_token"
    );


    window.location.replace(
        "login.html"
    );

}


// ============================================================
// LOAD DASHBOARD DATA
// ============================================================

async function loadDashboardData() {

    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        redirectToLogin();

        return;

    }


    console.log(
        "Loading dashboard data..."
    );


    try {

        const response =
            await fetch(
                `${API_URL}/dashboard/`,
                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        // ====================================================
        // TOKEN EXPIRED
        // ====================================================

        if (response.status === 401) {

            console.warn(
                "Session expired."
            );

            logout();

            return;

        }


        // ====================================================
        // OTHER API ERROR
        // ====================================================

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Dashboard API Error:",
                response.status,
                errorText
            );

            return;

        }


        // ====================================================
        // JSON
        // ====================================================

        const data =
            await response.json();


        console.log(
            "===================================="
        );

        console.log(
            "DASHBOARD DATA"
        );

        console.log(
            data
        );

        console.log(
            "===================================="
        );


        // ====================================================
        // USER
        // ====================================================

        if (data.user) {

            updateUserInformation(
                data.user
            );

        }


        // ====================================================
        // STATISTICS
        // ====================================================

        if (data.statistics) {

            updateStatistics(
                data.statistics
            );

        }


        // ====================================================
        // CONTINUE LEARNING
        // ====================================================

        if (
            Array.isArray(
                data.learning
            )
        ) {

            updateLearningCards(
                data.learning
            );

        }

    }

    catch (error) {

        console.error(
            "Unable to load dashboard:",
            error
        );

    }

}


// ============================================================
// UPDATE USER INFORMATION
// ============================================================

function updateUserInformation(user) {

    if (!user) return;


    const name =
        user.name ||
        "Developer";


    const email =
        user.email ||
        "";


    document
        .querySelectorAll("[data-user-name]")
        .forEach(element => {

            element.textContent = name;

        });


    document
        .querySelectorAll("[data-user-email]")
        .forEach(element => {

            element.textContent = email;

        });


    const nameElement =
        document.getElementById(
            "userName"
        );


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    const emailElement =
        document.getElementById(
            "userEmail"
        );


    if (emailElement) {

        emailElement.textContent =
            email;

    }


    // Keep local user data updated

    const currentUser =
        getLoggedInUser();


    if (currentUser) {

        currentUser.name =
            name;

        currentUser.email =
            email;


        localStorage.setItem(
            "user",
            JSON.stringify(
                currentUser
            )
        );

    }

}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics(statistics) {

    if (!statistics) return;


    console.log(
        "Updating statistics:",
        statistics
    );


    // ========================================================
    // PROJECTS
    // ========================================================

    updateElement(
        "[data-stat='projects']",
        statistics.projects ?? 0
    );


    // ========================================================
    // CONCEPTS
    // ========================================================

    updateElement(
        "[data-stat='concepts']",
        statistics.concepts ?? 0
    );


    // ========================================================
    // LEARNING HOURS
    // ========================================================

    updateElement(
        "[data-stat='learning-time']",
        formatLearningTime(
            statistics.learning_time
        )
    );


    // ========================================================
    // PROGRESS
    // ========================================================

    updateElement(
        "[data-stat='progress']",
        `${statistics.progress ?? 0}%`
    );

}


// ============================================================
// FORMAT LEARNING TIME
// ============================================================

function formatLearningTime(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "0h";

    }


    // Backend currently returns "2.5h"

    if (
        typeof value === "string" &&
        value.toLowerCase().includes("h")
    ) {

        return value;

    }


    // If backend returns a number

    const minutes =
        Number(value);


    if (!Number.isNaN(minutes)) {

        if (minutes < 60) {

            return `${minutes}m`;

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        const remainingMinutes =
            minutes % 60;


        if (remainingMinutes === 0) {

            return `${hours}h`;

        }


        return `${hours}h ${remainingMinutes}m`;

    }


    return "0h";

}


// ============================================================
// UPDATE LEARNING CARDS
// ============================================================

function updateLearningCards(learning) {

    const cards =
        document.querySelectorAll(
            ".learning-card"
        );


    if (!cards.length) {

        return;

    }


    // ========================================================
    // NO DATA
    // ========================================================

    if (
        !Array.isArray(learning) ||
        learning.length === 0
    ) {

        cards.forEach(card => {

            const title =
                card.querySelector(
                    ".learning-title"
                );

            const step =
                card.querySelector(
                    ".learning-step"
                );


            if (title) {

                title.textContent =
                    "No project yet";

            }


            if (step) {

                step.textContent =
                    "Start learning in Workspace";

            }

        });

        return;

    }


    // ========================================================
    // UPDATE CARDS
    // ========================================================

    cards.forEach(
        (card, index) => {

            const item =
                learning[index];


            if (!item) {

                return;

            }


            const title =
                card.querySelector(
                    ".learning-title"
                );


            const step =
                card.querySelector(
                    ".learning-step"
                );


            const progress =
                card.querySelector(
                    ".learning-progress"
                );


            const language =
                card.querySelector(
                    ".learning-language"
                );


            // ------------------------------------------------
            // TITLE
            // ------------------------------------------------

            if (title) {

                title.textContent =
                    item.title ||
                    "Untitled Project";

            }


            // ------------------------------------------------
            // STEP
            // ------------------------------------------------

            if (step) {

                step.textContent =
                    item.step ||
                    "Continue learning";

            }


            // ------------------------------------------------
            // LANGUAGE
            // ------------------------------------------------

            if (language) {

                language.textContent =
                    item.language ||
                    "Code";

            }


            // ------------------------------------------------
            // PROGRESS
            // ------------------------------------------------

            if (progress) {

                progress.textContent =
                    `${item.progress ?? 0}%`;

            }

        }
    );

}


// ============================================================
// UPDATE ELEMENT
// ============================================================

function updateElement(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );


    if (!element) {

        console.warn(
            `Dashboard element not found: ${selector}`
        );

        return;

    }


    element.textContent =
        value;

}


// ============================================================
// LOGIN CHECK
// ============================================================

function requireLogin() {

    const token =
        localStorage.getItem(
            "access_token"
        );


    if (!token) {

        redirectToLogin();

        return false;

    }


    return true;

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
// PREVENT BACK BUTTON AFTER LOGOUT
// ============================================================

window.addEventListener(
    "pageshow",
    event => {

        if (!event.persisted) {

            return;

        }


        const token =
            localStorage.getItem(
                "access_token"
            );


        if (!token) {

            redirectToLogin();

        }

    }
);


// ============================================================
// EXPORT
// ============================================================

window.dashboard = {

    logout,

    openWorkspace,

    getLoggedInUser,

    requireLogin,

    loadDashboardData,

    updateStatistics,

    updateLearningCards

};


// ============================================================
// END
// ============================================================

console.log(
    "dashboard.js loaded successfully."
);
