# ============================================================
# AI CODE TUTOR STUDIO
# services/gemini_service.py
# ============================================================

import os
import asyncio

from dotenv import load_dotenv
from google import genai


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# GEMINI API KEY
# ============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


if not GEMINI_API_KEY:

    raise RuntimeError(
        "GEMINI_API_KEY is missing from the .env file"
    )


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ============================================================
# SETTINGS
# ============================================================

MODEL_NAME = "gemini-3.6-flash"

MAX_RETRIES = 3

RETRY_DELAY = 5


# ============================================================
# GENERATE AI RESPONSE
# ============================================================

async def generate_ai_response(prompt: str):

    last_error = None


    for attempt in range(1, MAX_RETRIES + 1):

        try:

            print()
            print("========== GEMINI REQUEST ==========")
            print("Model:", MODEL_NAME)
            print("Attempt:", attempt)
            print("====================================")


            response = client.models.generate_content(

                model=MODEL_NAME,

                contents=prompt

            )


            # ----------------------------------------------
            # CHECK RESPONSE
            # ----------------------------------------------

            if not response:

                raise RuntimeError(
                    "Gemini returned an empty response."
                )


            if not response.text:

                raise RuntimeError(
                    "Gemini returned no text."
                )


            print()
            print("========== GEMINI SUCCESS ==========")
            print("Attempt:", attempt)
            print("====================================")


            return response.text


        except Exception as e:

            last_error = e

            error_text = str(e)


            print()
            print("========== GEMINI ERROR ==========")
            print(error_text)
            print("==================================")


            # ==================================================
            # 503 - MODEL TEMPORARILY UNAVAILABLE
            # ==================================================

            if (
                "503" in error_text
                or "UNAVAILABLE" in error_text
            ):

                if attempt < MAX_RETRIES:

                    print(
                        f"Gemini temporarily unavailable."
                    )

                    print(
                        f"Retrying in {RETRY_DELAY} seconds..."
                    )


                    await asyncio.sleep(
                        RETRY_DELAY
                    )


                    continue


                return (
                    "Gemini is temporarily unavailable "
                    "because the model is experiencing "
                    "high demand. Please try again "
                    "in a few seconds."
                )


            # ==================================================
            # 429 - QUOTA EXCEEDED
            # ==================================================

            if (
                "429" in error_text
                or "RESOURCE_EXHAUSTED" in error_text
                or "quota" in error_text.lower()
            ):

                return (
                    "Gemini API quota has been exceeded. "
                    "Please wait for the quota to reset "
                    "or use another Gemini API key/model."
                )


            # ==================================================
            # OTHER ERROR
            # ==================================================

            break


    # ========================================================
    # FINAL ERROR
    # ========================================================

    print()
    print("========== GEMINI FINAL ERROR ==========")
    print(str(last_error))
    print("========================================")


    raise RuntimeError(
        f"Gemini request failed: {last_error}"
    )
