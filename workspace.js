/* ==========================================================
   AI CODE TUTOR STUDIO
   workspace.js
   COMPLETE VERSION
   + LEARNING TIME TRACKER
========================================================== */

"use strict";


/* ==========================================================
   GLOBAL DATA
========================================================== */

const explanations = [

    {
        title: "Step 1",
        text:
            "This program starts by creating a function. " +
            "The function contains the instructions that will run."
    },

    {
        title: "Step 2",
        text:
            "The variable stores a value in memory so the program " +
            "can use it later."
    },

    {
        title: "Step 3",
        text:
            "The print statement displays the final output to the user."
    }

];


let currentStep = 0;


/* ==========================================================
   API CONFIGURATION
========================================================== */

const API_BASE_URL =
    "http://127.0.0.1:8000";


/* ==========================================================
   LEARNING TIMER
========================================================== */

/*
   Timer starts when workspace loads.

   IMPORTANT:

   We only send the NEW elapsed time to:

       POST /learning/session

   Your backend adds that time to MongoDB.

   Example:

   First save:
       30 seconds

   Second save:
       30 seconds

   MongoDB:
       60 seconds
*/


let learningStartTime = null;

let learningSavedSeconds = 0;

let learningTimerInterval = null;

let learningSaveInterval = null;

let learningTimerRunning = false;


/*
   Save every 30 seconds.
*/
const LEARNING_SAVE_INTERVAL =
    30000;


/* ==========================================================
   GET AUTH TOKEN
========================================================== */

function getAuthToken() {

    return localStorage.getItem(
        "access_token"
    );

}


/* ==========================================================
   START LEARNING TIMER
========================================================== */

function startLearningTimer() {

    if (learningTimerRunning) {
        return;
    }


    learningStartTime =
        Date.now();


    learningTimerRunning =
        true;


    console.log(
        "Learning timer started."
    );


    /*
       Update timer every second.
    */

    learningTimerInterval =
        setInterval(
            updateLearningTimerDisplay,
            1000
        );


    /*
       Save learning time every 30 seconds.
    */

    learningSaveInterval =
        setInterval(
            saveLearningTime,
            LEARNING_SAVE_INTERVAL
        );


    updateLearningTimerDisplay();

}


/* ==========================================================
   UPDATE TIMER DISPLAY
========================================================== */

function updateLearningTimerDisplay() {

    if (!learningTimerRunning) {
        return;
    }


    if (!learningStartTime) {
        return;
    }


    const elapsedSeconds =
        Math.floor(
            (
                Date.now() -
                learningStartTime
            ) / 1000
        );


    const totalSeconds =
        learningSavedSeconds +
        elapsedSeconds;


    updateLearningTimeUI(
        totalSeconds
    );

}


/* ==========================================================
   UPDATE LEARNING TIME UI
========================================================== */

function updateLearningTimeUI(
    seconds
) {

    seconds =
        Math.max(
            0,
            Math.floor(seconds)
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const remainingSeconds =
        seconds % 60;


    let timeText;


    if (hours > 0) {

        timeText =
            `${hours}h ${minutes}m`;

    }

    else if (minutes > 0) {

        timeText =
            `${minutes}m ${remainingSeconds}s`;

    }

    else {

        timeText =
            `${remainingSeconds}s`;

    }


    /*
       Support multiple possible
       dashboard selectors.
    */

    const elements =
        document.querySelectorAll(
            [
                "#learningTime",
                ".learning-time",
                ".learning-time-value",
                "[data-learning-time]"
            ].join(",")
        );


    elements.forEach(
        element => {

            element.innerText =
                timeText;

        }
    );


    /*
       Optional dashboard value
       in data attribute.
    */

    document
        .querySelectorAll(
            "[data-learning-seconds]"
        )
        .forEach(
            element => {

                element.innerText =
                    seconds;

            }
        );

}


/* ==========================================================
   GET UNSAVED LEARNING SECONDS
========================================================== */

function getUnsavedLearningSeconds() {

    if (
        !learningTimerRunning ||
        !learningStartTime
    ) {

        return 0;

    }


    const elapsed =
        Math.floor(
            (
                Date.now() -
                learningStartTime
            ) / 1000
        );


    return Math.max(
        0,
        elapsed
    );

}


/* ==========================================================
   SAVE LEARNING TIME
========================================================== */

async function saveLearningTime() {

    const unsavedSeconds =
        getUnsavedLearningSeconds();


    /*
       Nothing new to save.
    */

    if (
        unsavedSeconds <= 0
    ) {

        return;

    }


    const token =
        getAuthToken();


    /*
       User is not logged in.
       Don't send anonymous learning data.
    */

    if (!token) {

        console.warn(
            "Learning time not saved: user is not logged in."
        );

        return;

    }


    /*
       Calculate progress.

       Here we use current tutorial
       step as a simple workspace progress.

       Step 1 = 33%
       Step 2 = 67%
       Step 3 = 100%
    */

    const progress =
        explanations.length > 1
            ? Math.round(
                (
                    currentStep /
                    (
                        explanations.length - 1
                    )
                ) * 100
            )
            : 0;


    try {

        console.log(
            "Saving learning session:",
            {
                duration_seconds:
                    unsavedSeconds,

                progress:
                    progress
            }
        );


        const response =
            await fetch(
                `${API_BASE_URL}/learning/session`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            duration_seconds:
                                unsavedSeconds,

                            progress:
                                progress

                        })

                }
            );


        const text =
            await response.text();


        let result = {};


        try {

            result =
                text
                    ? JSON.parse(text)
                    : {};

        }

        catch {

            result = {
                detail: text
            };

        }


        if (!response.ok) {

            throw new Error(
                result.detail ||
                `Learning save failed: ${response.status}`
            );

        }


        /*
           IMPORTANT:

           We reset the timer AFTER successful save.

           This prevents sending the same
           seconds twice.
        */

        learningSavedSeconds +=
            unsavedSeconds;


        learningStartTime =
            Date.now();


        console.log(
            "Learning session saved successfully."
        );


    }

    catch (error) {

        console.error(
            "Learning save error:",
            error
        );

    }

}


/* ==========================================================
   SAVE LEARNING TIME BEFORE PAGE CLOSE
========================================================== */

function saveLearningTimeBeforeExit() {

    const unsavedSeconds =
        getUnsavedLearningSeconds();


    if (
        unsavedSeconds <= 0
    ) {

        return;

    }


    const token =
        getAuthToken();


    if (!token) {
        return;
    }


    const progress =
        explanations.length > 1
            ? Math.round(
                (
                    currentStep /
                    (
                        explanations.length - 1
                    )
                ) * 100
            )
            : 0;


    /*
       sendBeacon allows the request
       to continue while the page is closing.
    */

    const data =
        JSON.stringify({

            duration_seconds:
                unsavedSeconds,

            progress:
                progress

        });


    try {

        const blob =
            new Blob(
                [data],
                {
                    type:
                        "application/json"
                }
            );


        const sent =
            navigator.sendBeacon(
                `${API_BASE_URL}/learning/session`,
                blob
            );


        if (sent) {

            console.log(
                "Learning time sent before page close."
            );

        }

    }

    catch (error) {

        console.error(
            "Beacon learning save failed:",
            error
        );

    }

}


/* ==========================================================
   STOP LEARNING TIMER
========================================================== */

function stopLearningTimer() {

    if (!learningTimerRunning) {
        return;
    }


    /*
       Save remaining time.
    */

    saveLearningTime();


    learningTimerRunning =
        false;


    if (learningTimerInterval) {

        clearInterval(
            learningTimerInterval
        );

        learningTimerInterval =
            null;

    }


    if (learningSaveInterval) {

        clearInterval(
            learningSaveInterval
        );

        learningSaveInterval =
            null;

    }


    console.log(
        "Learning timer stopped."
    );

}


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "======================================"
        );

        console.log(
            "AI CODE TUTOR STUDIO"
        );

        console.log(
            "Workspace JS Connected"
        );

        console.log(
            "======================================"
        );


        initializeWorkspace();


        /*
           Start learning timer AFTER
           workspace initialization.
        */

        startLearningTimer();

    }
);


/* ==========================================================
   PAGE EXIT EVENTS
========================================================== */

window.addEventListener(
    "beforeunload",
    saveLearningTimeBeforeExit
);


document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "hidden"
        ) {

            saveLearningTimeBeforeExit();

        }

    }
);


/* ==========================================================
   INITIALIZE WORKSPACE
========================================================== */

function initializeWorkspace() {

    setupLanguage();

    setupLearningMode();

    setupFiles();

    setupNavigation();

    setupAIButtons();

    setupRunButtons();

    setupChatInput();

    setupFileButtons();


    console.log(
        "Workspace initialized successfully."
    );

}


/* ==========================================================
   GET EDITOR CODE
========================================================== */

function getCode() {

    try {

        if (
            typeof editor !== "undefined" &&
            editor &&
            typeof editor.getValue === "function"
        ) {

            return editor.getValue();

        }

    }

    catch (error) {

        console.error(
            "Editor error:",
            error
        );

    }


    try {

        const editorElement =
            document.querySelector(
                ".CodeMirror"
            );


        if (
            editorElement &&
            editorElement.CodeMirror
        ) {

            return editorElement
                .CodeMirror
                .getValue();

        }

    }

    catch (error) {

        console.error(
            "CodeMirror error:",
            error
        );

    }


    /*
       Fallback for textarea editors.
    */

    const textarea =
        document.querySelector(
            "#codeEditor, .code-editor, textarea"
        );


    if (textarea) {

        return textarea.value || "";

    }


    console.error(
        "Editor not found."
    );


    return "";

}


/* ==========================================================
   GET LANGUAGE
========================================================== */

function getLanguage() {

    const language =
        document.getElementById(
            "language"
        );


    if (language) {

        return language.value;

    }


    return "Python";

}


/* ==========================================================
   GET LEVEL
========================================================== */

function getLevel() {

    const level =
        document.getElementById(
            "level"
        );


    if (level) {

        return level.value;

    }


    return "Beginner";

}


/* ==========================================================
   LANGUAGE SELECT
========================================================== */

function setupLanguage() {

    const language =
        document.getElementById(
            "language"
        );


    if (!language) {
        return;
    }


    language.addEventListener(
        "change",
        () => {

            console.log(
                "Language:",
                language.value
            );

        }
    );

}


/* ==========================================================
   LEARNING MODE
========================================================== */

function setupLearningMode() {

    const level =
        document.getElementById(
            "level"
        );


    if (!level) {
        return;
    }


    level.addEventListener(
        "change",
        () => {

            console.log(
                "Learning Level:",
                level.value
            );

        }
    );

}


/* ==========================================================
   FILE EXPLORER
========================================================== */

function setupFiles() {

    const files =
        document.querySelectorAll(
            ".file"
        );


    files.forEach(
        file => {

            file.addEventListener(
                "click",
                () => {

                    files.forEach(
                        f => {

                            f.classList.remove(
                                "active"
                            );

                        }
                    );


                    file.classList.add(
                        "active"
                    );


                    const fileName =
                        file.dataset.filename ||
                        file.innerText.trim();


                    const storedCode =
                        file.dataset.code;


                    if (
                        storedCode !== undefined &&
                        typeof editor !== "undefined" &&
                        editor
                    ) {

                        editor.setValue(
                            storedCode
                        );

                    }


                    updateEditorFileName(
                        fileName
                    );

                }
            );

        }
    );


    const uploadButton =
        document.querySelector(
            ".upload-file-btn"
        );


    if (uploadButton) {

        uploadButton.addEventListener(
            "click",
            uploadFile
        );

    }

}


/* ==========================================================
   UPLOAD FILE
========================================================== */

function uploadFile() {

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";


    input.accept =
        ".py,.js,.java,.c,.cpp,.html,.css,.txt,.md";


    input.style.display =
        "none";


    document.body.appendChild(
        input
    );


    input.addEventListener(
        "change",
        async () => {

            const file =
                input.files[0];


            if (!file) {

                document.body.removeChild(
                    input
                );

                return;

            }


            try {

                const code =
                    await file.text();


                if (
                    typeof editor !== "undefined" &&
                    editor &&
                    typeof editor.setValue === "function"
                ) {

                    editor.setValue(
                        code
                    );

                }


                addFileToExplorer(
                    file.name,
                    code
                );


                updateEditorFileName(
                    file.name
                );


                showConsoleMessage(
                    `Uploaded: ${file.name}`
                );

            }

            catch (error) {

                console.error(
                    "Upload error:",
                    error
                );


                alert(
                    "Unable to read this file."
                );

            }


            document.body.removeChild(
                input
            );

        }
    );


    input.click();

}


/* ==========================================================
   ADD FILE TO EXPLORER
========================================================== */

function addFileToExplorer(
    fileName,
    code
) {

    const explorer =
        document.querySelector(
            ".explorer"
        );


    if (!explorer) {

        console.error(
            "Explorer not found."
        );

        return;

    }


    const existing =
        Array.from(
            explorer.querySelectorAll(
                ".file"
            )
        ).find(
            file =>
                file.innerText.trim() ===
                fileName
        );


    if (existing) {

        document
            .querySelectorAll(
                ".file"
            )
            .forEach(
                file => {

                    file.classList.remove(
                        "active"
                    );

                }
            );


        existing.classList.add(
            "active"
        );


        existing.dataset.code =
            code;


        return;

    }


    const file =
        document.createElement(
            "div"
        );


    file.className =
        "file active";


    file.dataset.filename =
        fileName;


    file.dataset.code =
        code;


    file.innerHTML =
        `
        <span class="file-icon">📄</span>
        <span>${fileName}</span>
        `;


    explorer
        .querySelectorAll(
            ".file"
        )
        .forEach(
            existingFile => {

                existingFile.classList.remove(
                    "active"
                );

            }
        );


    explorer.appendChild(
        file
    );


    file.addEventListener(
        "click",
        () => {

            explorer
                .querySelectorAll(
                    ".file"
                )
                .forEach(
                    f => {

                        f.classList.remove(
                            "active"
                        );

                    }
                );


            file.classList.add(
                "active"
            );


            if (
                typeof editor !== "undefined" &&
                editor
            ) {

                editor.setValue(
                    file.dataset.code || ""
                );

            }


            updateEditorFileName(
                fileName
            );

        }
    );

}


/* ==========================================================
   UPDATE EDITOR FILE NAME
========================================================== */

function updateEditorFileName(
    fileName
) {

    const fileNameElements =
        document.querySelectorAll(
            ".file-name, .editor-file-name"
        );


    fileNameElements.forEach(
        element => {

            element.innerText =
                fileName;

        }
    );


    const possibleNames =
        document.querySelectorAll(
            "h1, h2, h3, .filename"
        );


    possibleNames.forEach(
        element => {

            if (
                element.innerText
                    .trim()
                    .match(
                        /\.(py|js|java|c|cpp|html|css|md|txt)$/i
                    )
            ) {

                element.innerText =
                    fileName;

            }

        }
    );

}


/* ==========================================================
   NAVIGATION
========================================================== */

function setupNavigation() {

    const nextButtons =
        document.querySelectorAll(
            ".navigation button:last-child"
        );


    const previousButtons =
        document.querySelectorAll(
            ".navigation button:first-child"
        );


    nextButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                nextStep
            );

        }
    );


    previousButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                previousStep
            );

        }
    );

}


/* ==========================================================
   NEXT STEP
========================================================== */

function nextStep() {

    if (
        currentStep <
        explanations.length - 1
    ) {

        currentStep++;


        showExplanation(
            currentStep
        );


        /*
           Update learning dashboard
           immediately.
        */

        updateLearningTimerDisplay();

    }

}


/* ==========================================================
   PREVIOUS STEP
========================================================== */

function previousStep() {

    if (
        currentStep >
        0
    ) {

        currentStep--;


        showExplanation(
            currentStep
        );


        updateLearningTimerDisplay();

    }

}


/* ==========================================================
   SHOW EXPLANATION
========================================================== */

function showExplanation(
    step
) {

    const explanation =
        document.querySelector(
            ".explanation"
        );


    if (!explanation) {
        return;
    }


    const title =
        explanation.querySelector(
            "h3"
        );


    const text =
        explanation.querySelector(
            "p"
        );


    if (
        title &&
        explanations[step]
    ) {

        title.innerText =
            explanations[step].title;

    }


    if (
        text &&
        explanations[step]
    ) {

        text.innerText =
            explanations[step].text;

    }

}


/* ==========================================================
   RUN BUTTONS
========================================================== */

function setupRunButtons() {

    const buttons =
        getButtons(
            [
                "#runBtn",
                ".run-btn"
            ],
            "Run"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                runCode
            );

        }
    );


    console.log(
        "Run buttons:",
        buttons.length
    );

}


async function runCode() {

    const code = getCode();

    if (!code || !code.trim()) {

        showConsoleMessage(
            "Please enter some code first."
        );

        return;
    }


    const language = getLanguage();


    /* ======================================================
       GET PROGRAM INPUT
    ====================================================== */

    const inputElement =
        document.getElementById("programInput");

    const programInput =
        inputElement
            ? inputElement.value
            : "";


    console.log("========== FRONTEND RUN ==========");
    console.log("Language:", language);
    console.log("Input:", JSON.stringify(programInput));
    console.log("Code:", code);


    /* ======================================================
       BUTTONS
    ====================================================== */

    const buttons = getButtons(
        [
            "#runBtn",
            ".run-btn"
        ],
        "Run"
    );


    setButtonsLoading(
        buttons,
        "Running..."
    );


    /* ======================================================
       CONSOLE
    ====================================================== */

    showConsoleMessage(
        "Running program..."
    );


    try {

        /* ==================================================
           SEND REQUEST
        ================================================== */

        const result = await postRequest(
            "/run/",
            {

                code: code,

                language: language,

                input: programInput

            }
        );


        console.log(
            "========== BACKEND RESPONSE =========="
        );

        console.log(result);


        /* ==================================================
           DISPLAY RESULT
        ================================================== */

        displayRunResult(result);


    }

    catch (error) {

        console.error(
            "Run error:",
            error
        );


        showConsoleMessage(
            "Run failed:\n\n" +
            error.message
        );

    }

    finally {

        resetButtons(
            buttons,
            "▶ Run"
        );

    }

}

/* ==========================================================
   DISPLAY RUN RESULT
========================================================== */

function displayRunResult(result) {

    const consoleBox =
        document.querySelector(
            ".console-output"
        );


    if (!consoleBox) {
        return;
    }


    consoleBox.innerHTML = "";


    /* ======================================================
       OUTPUT
    ====================================================== */

    const output =
        result && result.output
            ? String(result.output)
            : "";


    /* ======================================================
       ERROR
    ====================================================== */

    const error =
        result && result.error
            ? String(result.error)
            : "";


    /* ======================================================
       OUTPUT ELEMENT
    ====================================================== */

    const outputBox =
        document.createElement("pre");


    outputBox.className =
        "run-result-output";


    /* ======================================================
       SUCCESS
    ====================================================== */

    if (
        result &&
        result.success === true
    ) {

        outputBox.innerText =
            output ||
            "Program executed successfully.";

    }


    /* ======================================================
       ERROR
    ====================================================== */

    else {

        outputBox.innerText =
            (
                output
                    ? output + "\n\n"
                    : ""
            ) +
            (
                error
                    ? "Program Error:\n\n" + error
                    : "Program failed."
            );

    }


    consoleBox.appendChild(
        outputBox
    );

}
/* ==========================================================
   AI BUTTON SETUP
========================================================== */

function setupAIButtons() {

    const analyzeButtons =
        getButtons(
            [
                "#analyzeBtn",
                ".analyze-btn"
            ],
            "Analyze"
        );


    const errorButtons =
        getButtons(
            [
                "#errorBtn",
                ".error-btn"
            ],
            "Errors"
        );


    const algorithmButtons =
        getButtons(
            [
                "#algorithmBtn",
                ".algorithm-btn"
            ],
            "Algorithm"
        );


    const chatButtons =
        getButtons(
            [
                "#chatBtn",
                ".chat-btn"
            ],
            "Chat"
        );


    analyzeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                analyzeCode
            );

        }
    );


    errorButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                analyzeErrors
            );

        }
    );


    algorithmButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                analyzeAlgorithm
            );

        }
    );


    chatButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                askAI
            );

        }
    );

}


/* ==========================================================
   ANALYZE
========================================================== */

async function analyzeCode() {

    const code =
        getCode();


    if (
        !code ||
        !code.trim()
    ) {

        alert(
            "Please enter some code first."
        );

        return;

    }


    const buttons =
        getButtons(
            [
                "#analyzeBtn",
                ".analyze-btn"
            ],
            "Analyze"
        );


    setButtonsLoading(
        buttons,
        "Analyzing..."
    );


    try {

        const result =
            await postRequest(
                "/analyze/",
                {

                    code:
                        code,

                    language:
                        getLanguage(),

                    level:
                        getLevel()

                }
            );


        if (!result) {

            throw new Error(
                "No response received."
            );

        }


        displayAIResult(
            result,
            "🧠 AI Code Analysis"
        );

    }

    catch (error) {

        console.error(
            "Analyze error:",
            error
        );


        displayAIError(
            "Analyze failed: " +
            error.message
        );

    }

    finally {

        resetButtons(
            buttons,
            "🧠 Analyze"
        );

    }

}


/* ==========================================================
   FIND ERRORS
========================================================== */

async function analyzeErrors() {

    const code =
        getCode();


    if (
        !code ||
        !code.trim()
    ) {

        alert(
            "Please enter some code first."
        );

        return;

    }


    const buttons =
        getButtons(
            [
                "#errorBtn",
                ".error-btn"
            ],
            "Errors"
        );


    setButtonsLoading(
        buttons,
        "Checking..."
    );


    try {

        const result =
            await postRequest(
                "/errors/",
                {

                    code:
                        code,

                    language:
                        getLanguage(),

                    level:
                        getLevel()

                }
            );


        if (!result) {

            throw new Error(
                "No response received."
            );

        }


        displayAIResult(
            result,
            "🐞 Error Analysis"
        );

    }

    catch (error) {

        console.error(
            "Errors error:",
            error
        );


        displayAIError(
            "Error analysis failed: " +
            error.message
        );

    }

    finally {

        resetButtons(
            buttons,
            "🐞 Errors"
        );

    }

}


/* ==========================================================
   ALGORITHM
========================================================== */

async function analyzeAlgorithm() {

    const code =
        getCode();


    if (
        !code ||
        !code.trim()
    ) {

        alert(
            "Please enter some code first."
        );

        return;

    }


    const buttons =
        getButtons(
            [
                "#algorithmBtn",
                ".algorithm-btn"
            ],
            "Algorithm"
        );


    setButtonsLoading(
        buttons,
        "Analyzing..."
    );


    try {

        const result =
            await postRequest(
                "/algorithm/",
                {

                    code:
                        code,

                    language:
                        getLanguage()

                }
            );


        if (!result) {

            throw new Error(
                "No response received."
            );

        }


        displayAIResult(
            result,
            "📊 Algorithm Analysis"
        );

    }

    catch (error) {

        console.error(
            "Algorithm error:",
            error
        );


        displayAIError(
            "Algorithm analysis failed: " +
            error.message
        );

    }

    finally {

        resetButtons(
            buttons,
            "📊 Algorithm"
        );

    }

}


/* ==========================================================
   ASK AI
========================================================== */

async function askAI() {

    const question =
        prompt(
            "Ask AI about your code:"
        );


    if (
        !question ||
        !question.trim()
    ) {

        return;

    }


    const code =
        getCode();


    if (
        !code ||
        !code.trim()
    ) {

        alert(
            "Please enter some code first."
        );

        return;

    }


    const buttons =
        getButtons(
            [
                "#chatBtn",
                ".chat-btn"
            ],
            "Chat"
        );


    setButtonsLoading(
        buttons,
        "Thinking..."
    );


    try {

        const result =
            await postRequest(
                "/chat/",
                {

                    question:
                        question,

                    code:
                        code,

                    language:
                        getLanguage()

                }
            );


        if (!result) {

            throw new Error(
                "No response received."
            );

        }


        displayAIResult(
            result,
            "💬 AI Tutor"
        );

    }

    catch (error) {

        console.error(
            "Chat error:",
            error
        );


        displayAIError(
            "Chat failed: " +
            error.message
        );

    }

    finally {

        resetButtons(
            buttons,
            "💬 Chat"
        );

    }

}


/* ==========================================================
   DISPLAY AI RESULT
========================================================== */

function displayAIResult(
    result,
    heading
) {

    let text = "";


    if (
        result.answer !== undefined
    ) {

        text =
            result.answer;

    }

    else if (
        result.result !== undefined
    ) {

        text =
            result.result;

    }

    else {

        text =
            formatAnalyzeResponse(
                result
            );

    }


    const explanation =
        document.querySelector(
            ".explanation"
        );


    if (explanation) {

        explanation.innerHTML =
            "";


        const title =
            document.createElement(
                "h3"
            );


        title.innerText =
            heading;


        const content =
            document.createElement(
                "div"
            );


        content.className =
            "ai-result-content";


        content.innerText =
            String(
                text ||
                "No AI response received."
            );


        explanation.appendChild(
            title
        );


        explanation.appendChild(
            content
        );


        return;

    }


    alert(
        String(
            text ||
            "No AI response received."
        )
    );

}


/* ==========================================================
   FORMAT ANALYZE RESPONSE
========================================================== */

function formatAnalyzeResponse(
    result
) {

    let output = "";


    if (result.title) {

        output +=
            "Title:\n" +
            result.title +
            "\n\n";

    }


    if (result.purpose) {

        output +=
            "Purpose:\n" +
            result.purpose +
            "\n\n";

    }


    if (
        Array.isArray(
            result.steps
        )
    ) {

        output +=
            "Steps:\n";


        result.steps.forEach(
            step => {

                output +=
                    (
                        step.step ||
                        ""
                    ) +
                    ". " +
                    (
                        step.title ||
                        ""
                    ) +
                    "\n";


                if (
                    step.description
                ) {

                    output +=
                        step.description +
                        "\n";

                }


                output +=
                    "\n";

            }
        );

    }


    if (result.algorithm) {

        output +=
            "Algorithm:\n" +
            result.algorithm +
            "\n\n";

    }


    if (
        result.time_complexity
    ) {

        output +=
            "Time Complexity:\n" +
            result.time_complexity +
            "\n\n";

    }


    if (
        result.space_complexity
    ) {

        output +=
            "Space Complexity:\n" +
            result.space_complexity +
            "\n\n";

    }


    if (
        Array.isArray(
            result.errors
        )
    ) {

        output +=
            "Errors:\n";


        if (
            result.errors.length === 0
        ) {

            output +=
                "No errors found.\n";

        }

        else {

            result.errors.forEach(
                error => {

                    output +=
                        "• " +
                        error +
                        "\n";

                }
            );

        }


        output +=
            "\n";

    }


    if (!output.trim()) {

        output =
            JSON.stringify(
                result,
                null,
                2
            );

    }


    return output;

}


/* ==========================================================
   DISPLAY AI ERROR
========================================================== */

function displayAIError(
    message
) {

    console.error(
        message
    );


    const explanation =
        document.querySelector(
            ".explanation"
        );


    if (!explanation) {

        alert(
            message
        );

        return;

    }


    explanation.innerHTML =
        "";


    const title =
        document.createElement(
            "h3"
        );


    title.innerText =
        "AI Error";


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "ai-result-content";


    content.innerText =
        message;


    explanation.appendChild(
        title
    );


    explanation.appendChild(
        content
    );

}


/* ==========================================================
   CHAT INPUT
========================================================== */

function setupChatInput() {

    const input =
        document.querySelector(
            ".chat-box input"
        );


    const button =
        document.querySelector(
            ".chat-box button"
        );


    if (
        !input ||
        !button
    ) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            const question =
                input.value.trim();


            if (!question) {
                return;
            }


            addChatMessage(
                "You",
                question
            );


            input.value =
                "";

        }
    );

}


/* ==========================================================
   ADD CHAT MESSAGE
========================================================== */

function addChatMessage(
    user,
    message
) {

    const chat =
        document.querySelector(
            ".chat-box"
        );


    if (!chat) {
        return;
    }


    const div =
        document.createElement(
            "p"
        );


    const strong =
        document.createElement(
            "strong"
        );


    strong.innerText =
        user + ": ";


    div.appendChild(
        strong
    );


    div.appendChild(
        document.createTextNode(
            message
        )
    );


    chat.before(
        div
    );

}


/* ==========================================================
   GET BUTTONS
========================================================== */

function getButtons(
    selectors,
    textFallback
) {

    const buttons = [];


    selectors.forEach(
        selector => {

            document
                .querySelectorAll(
                    selector
                )
                .forEach(
                    button => {

                        if (
                            !buttons.includes(
                                button
                            )
                        ) {

                            buttons.push(
                                button
                            );

                        }

                    }
                );

        }
    );


    if (
        buttons.length === 0 &&
        textFallback
    ) {

        document
            .querySelectorAll(
                "button"
            )
            .forEach(
                button => {

                    const text =
                        button.innerText
                            .trim()
                            .toLowerCase();


                    if (
                        text ===
                        textFallback
                            .toLowerCase()
                    ) {

                        buttons.push(
                            button
                        );

                    }

                }
            );

    }


    return buttons;

}


/* ==========================================================
   SET BUTTON LOADING
========================================================== */

function setButtonsLoading(
    buttons,
    text
) {

    buttons.forEach(
        button => {

            button.disabled =
                true;


            button.dataset.originalText =
                button.innerText;


            button.innerText =
                text;

        }
    );

}


/* ==========================================================
   RESET BUTTONS
========================================================== */

function resetButtons(
    buttons,
    fallbackText
) {

    buttons.forEach(
        button => {

            button.disabled =
                false;


            const original =
                button.dataset.originalText;


            button.innerText =
                original ||
                fallbackText;

        }
    );

}


/* ==========================================================
   SHOW CONSOLE MESSAGE
========================================================== */

function showConsoleMessage(
    message
) {

    const consoleBox =
        document.querySelector(
            ".console-output"
        );


    if (!consoleBox) {
        return;
    }


    consoleBox.innerHTML =
        "";


    const pre =
        document.createElement(
            "pre"
        );


    pre.innerText =
        message;


    consoleBox.appendChild(
        pre
    );

}


/* ==========================================================
   NEW / OPEN / SAVE
========================================================== */

function setupFileButtons() {

    const newButtons =
        getButtons(
            [
                "#newBtn",
                ".new-btn"
            ],
            "New"
        );


    const openButtons =
        getButtons(
            [
                "#openBtn",
                ".open-btn"
            ],
            "Open"
        );


    const saveButtons =
        getButtons(
            [
                "#saveBtn",
                ".save-btn"
            ],
            "Save"
        );


    newButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                createNewFile
            );

        }
    );


    openButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                openFile
            );

        }
    );


    saveButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                saveFile
            );

        }
    );

}


/* ==========================================================
   NEW FILE
========================================================== */

function createNewFile() {

    const code =
        getCode();


    if (
        code.trim() !== ""
    ) {

        const confirmNew =
            confirm(
                "Create a new file?\n\n" +
                "Your current code will be cleared."
            );


        if (!confirmNew) {
            return;
        }

    }


    if (
        typeof editor !== "undefined" &&
        editor &&
        typeof editor.setValue === "function"
    ) {

        editor.setValue("");

    }


    const fileName =
        document.querySelector(
            ".file-name"
        );


    if (fileName) {

        fileName.innerText =
            "untitled.py";

    }


    showConsoleMessage(
        "New file created.\n\nWaiting for execution..."
    );


    currentStep =
        0;


    showExplanation(
        0
    );

}


/* ==========================================================
   OPEN FILE
========================================================== */

function openFile() {

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";


    input.accept =
        ".py,.js,.java,.c,.cpp,.html,.css,.txt,.md";


    input.style.display =
        "none";


    document.body.appendChild(
        input
    );


    input.addEventListener(
        "change",
        async function () {

            const file =
                input.files[0];


            if (!file) {

                document.body.removeChild(
                    input
                );

                return;

            }


            try {

                const content =
                    await file.text();


                if (
                    typeof editor !== "undefined" &&
                    editor &&
                    typeof editor.setValue === "function"
                ) {

                    editor.setValue(
                        content
                    );

                }


                updateEditorFileName(
                    file.name
                );


                showConsoleMessage(
                    `Opened: ${file.name}`
                );

            }

            catch (error) {

                console.error(
                    "Open file error:",
                    error
                );


                alert(
                    "Unable to open the file."
                );

            }


            document.body.removeChild(
                input
            );

        }
    );


    input.click();

}


/* ==========================================================
   SAVE FILE
========================================================== */

function saveFile() {

    const code =
        getCode();


    if (
        !code ||
        !code.trim()
    ) {

        alert(
            "There is no code to save."
        );

        return;

    }


    const language =
        getLanguage()
            .toLowerCase();


    let extension =
        ".py";


    if (
        language ===
        "javascript"
    ) {

        extension =
            ".js";

    }

    else if (
        language ===
        "java"
    ) {

        extension =
            ".java";

    }

    else if (
        language ===
        "c"
    ) {

        extension =
            ".c";

    }

    else if (
        language ===
        "c++"
    ) {

        extension =
            ".cpp";

    }

    else if (
        language ===
        "html"
    ) {

        extension =
            ".html";

    }

    else if (
        language ===
        "css"
    ) {

        extension =
            ".css";

    }


    let fileName =
        "main" +
        extension;


    const fileElement =
        document.querySelector(
            ".file-name"
        );


    if (
        fileElement &&
        fileElement.innerText
    ) {

        const existingName =
            fileElement.innerText.trim();


        if (
            existingName &&
            existingName !==
            "untitled.py"
        ) {

            fileName =
                existingName;

        }

    }


    const blob =
        new Blob(
            [code],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        fileName;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );


    showConsoleMessage(
        `File saved successfully:\n${fileName}`
    );

}


/* ==========================================================
   API REQUEST HELPER
========================================================== */

async function postRequest(
    endpoint,
    data
) {

    const token =
        localStorage.getItem(
            "access_token"
        );


    const headers = {

        "Content-Type":
            "application/json"

    };


    if (token) {

        headers[
            "Authorization"
        ] =
            `Bearer ${token}`;

    }


    console.log(
        "API REQUEST:",
        endpoint
    );


    console.log(
        "DATA:",
        data
    );


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {

                method:
                    "POST",

                headers:
                    headers,

                body:
                    JSON.stringify(
                        data
                    )

            }
        );


    const responseText =
        await response.text();


    let result;


    try {

        result =
            responseText
                ? JSON.parse(
                    responseText
                )
                : {};

    }

    catch {

        result = {

            detail:
                responseText

        };

    }


    if (!response.ok) {

        const message =
            result.detail ||
            result.message ||
            `Server error: ${response.status}`;


        throw new Error(
            message
        );

    }


    return result;

}


/* ==========================================================
   END
========================================================== */

console.log(
    "workspace.js loaded successfully."
);



/* ==========================================================
   CONSOLE
========================================================== */

function setupConsole() {

    const clearButton =
        document.getElementById(
            "clearConsoleBtn"
        );


    if (!clearButton) {
        return;
    }


    clearButton.addEventListener(
        "click",
        () => {

            showConsoleMessage(
                "Waiting for execution..."
            );


            const input =
                document.getElementById(
                    "programInput"
                );


            if (input) {

                input.value = "";

            }

        }
    );

}
















/* ==========================================================
   AUTO SCROLL DRY RUN CONSOLE
========================================================== */

function scrollConsoleToBottom() {

    const consoleOutput =
        document.querySelector(".console-output");

    if (!consoleOutput) {
        return;
    }

    consoleOutput.scrollTop =
        consoleOutput.scrollHeight;
}


/* ==========================================================
   UPDATED DISPLAY RUN RESULT
========================================================== */

function displayRunResult(result) {

    const consoleBox =
        document.querySelector(".console-output");

    if (!consoleBox) {
        return;
    }

    let output = "";

    if (
        result.output !== undefined &&
        result.output !== null
    ) {

        output = String(result.output);

    }

    else if (
        result.result !== undefined &&
        result.result !== null
    ) {

        output = String(result.result);

    }

    else if (
        result.error !== undefined &&
        result.error !== null
    ) {

        output =
            "Program Error:\n\n" +
            String(result.error);

    }

    else {

        output =
            JSON.stringify(
                result,
                null,
                2
            );

    }


    /* Clear old output */

    consoleBox.innerHTML = "";


    /* Create output element */

    const outputBox =
        document.createElement("pre");

    outputBox.className =
        "run-result-output";

    outputBox.innerText =
        output;


    consoleBox.appendChild(
        outputBox
    );


    /* Wait for browser layout */

    requestAnimationFrame(() => {

        scrollConsoleToBottom();

    });

}