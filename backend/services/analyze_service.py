from services.gemini_service import generate_ai_response


async def analyze_code(code: str, language: str, level: str):

    prompt = f"""
You are an expert programming teacher.

Analyze the following {language} code for a {level} learner.

CODE:

{code}

Return the response using this structure:

TITLE:
Give a short title for the program.

PURPOSE:
Explain what the program does in simple beginner-friendly language.

STEPS:
1. Explain the first important step.
2. Explain the second important step.
3. Explain the next important step.
4. Continue if necessary.

ALGORITHM:
Explain the algorithm or logic used by the program.

TIME COMPLEXITY:
Give the time complexity and explain why.

SPACE COMPLEXITY:
Give the space complexity and explain why.

ERRORS:
Identify any errors or problems.
If there are no errors, write:
No major errors found.

OUTPUT:
Show the expected output if the program produces output.

EXPLANATION:
Give a complete beginner-friendly explanation of the program.
"""

    result = await generate_ai_response(prompt)

    return result
