# ============================================================
# AI CODE TUTOR STUDIO
# services/algorithm_service.py
# ============================================================

from services.gemini_service import generate_ai_response


async def analyze_algorithm(
    code: str,
    language: str = "Python"
):
    """
    Analyze the algorithm used in the given code using Gemini AI.
    """

    prompt = f"""
You are an expert programming teacher and algorithm analyst.

Analyze the following {language} code.

CODE:
{code}

Provide a clear explanation for a beginner.

Use the following structure:

Algorithm:
Explain the algorithm used.

How It Works:
Explain the execution step by step.

Input:
Explain what input the program accepts.

Output:
Explain what output the program produces.

Time Complexity:
Give the Big-O time complexity and explain why.

Space Complexity:
Give the Big-O space complexity and explain why.

Key Concepts:
List the important programming concepts used.

Optimization:
Suggest improvements if the algorithm can be optimized.

Keep the explanation accurate and easy to understand.
"""

    try:
        result = await generate_ai_response(prompt)

        return result

    except Exception as e:
        print("========== ALGORITHM SERVICE ERROR ==========")
        print(str(e))

        raise