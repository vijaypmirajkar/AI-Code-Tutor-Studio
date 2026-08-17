# ============================================================
# AI CODE TUTOR STUDIO
# Gemini AI Service
# services/openai_service.py
# ============================================================

import os
from dotenv import load_dotenv
from google import genai


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


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


# Current Gemini model
MODEL = "gemini-3.6-flash"


# ============================================================
# COMMON GEMINI FUNCTION
# ============================================================

async def generate_ai_response(prompt: str):

    try:

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

        return response.text

    except Exception as e:

        print("\n========== GEMINI ERROR ==========")
        print(str(e))
        print("==================================\n")

        raise e


# ============================================================
# ANALYZE CODE
# ============================================================

async def analyze_code(
    code: str,
    language: str,
    level: str
):

    prompt = f"""
You are an expert programming teacher.

You are part of an application called
AI Code Tutor Studio.

Analyze the following code and explain it
clearly for a {level} level student.

Programming Language:
{language}

Code:
--------------------
{code}
--------------------

Return the answer using this structure:

TITLE:
Give a short title for the code.

PURPOSE:
Explain what the program does.

STEPS:
Explain the code step by step.

ALGORITHM:
Explain the algorithm or logic used.

TIME COMPLEXITY:
Give the time complexity.

SPACE COMPLEXITY:
Give the space complexity.

ERRORS:
Mention possible errors or problems.

OUTPUT:
Explain what output the program produces.

IMPORTANT:
Keep the explanation simple and educational.
"""


    print("\n========== GEMINI ANALYZE ==========")

    result = await generate_ai_response(prompt)

    print("Gemini response received")

    print("====================================\n")

    return result


# ============================================================
# CHAT
# ============================================================

async def chat_with_ai(
    question: str,
    code: str,
    language: str
):

    prompt = f"""
You are an AI programming tutor.

Programming language:
{language}

Current code:
--------------------
{code}
--------------------

Student question:
{question}

Answer the student's question clearly.

Explain the answer step by step when useful.

Do not unnecessarily rewrite the entire program.
"""


    return await generate_ai_response(prompt)


# ============================================================
# ERROR ANALYSIS
# ============================================================

async def analyze_errors(
    code: str,
    language: str = "Python"
):

    prompt = f"""
You are an expert debugging assistant.

Analyze this {language} code:

--------------------
{code}
--------------------

Find:

1. Syntax errors
2. Runtime errors
3. Logical errors
4. Potential bugs
5. Improvements

For every error explain:

- What is wrong
- Why it happens
- How to fix it

If there are no errors, clearly say:

"No obvious errors found."
"""


    return await generate_ai_response(prompt)


# ============================================================
# ALGORITHM ANALYSIS
# ============================================================

async def analyze_algorithm(
    code: str,
    language: str = "Python"
):

    prompt = f"""
You are an expert computer science teacher.

Analyze this {language} code:

--------------------
{code}
--------------------

Identify:

1. Algorithm used
2. How the algorithm works
3. Step-by-step execution
4. Time complexity
5. Space complexity
6. Best case
7. Average case
8. Worst case

Explain everything in a beginner-friendly way.
"""


    return await generate_ai_response(prompt)
