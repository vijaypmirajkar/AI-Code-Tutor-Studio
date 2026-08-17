/* ==========================================================
   AI CODE TUTOR STUDIO
   api.js
========================================================== */

const API_URL = "https://ai-code-tutor-studio.onrender.com";


async function postRequest(endpoint, data) {

    console.log("API REQUEST:", endpoint);
    console.log("DATA:", data);

    try {

        const response = await fetch(
            `${API_URL}${endpoint}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        const text = await response.text();

        let result;

        try {
            result = JSON.parse(text);
        } catch {
            result = {
                detail: text
            };
        }

        if (!response.ok) {

            throw new Error(
                result.detail ||
                `HTTP ${response.status}`
            );
        }

        console.log("API RESPONSE:", result);

        return result;

    } catch (error) {

        console.error(
            "POST REQUEST ERROR:",
            error
        );

        throw error;
    }
}
