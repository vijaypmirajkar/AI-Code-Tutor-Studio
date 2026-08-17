from services.gemini_service import generate_ai_response


async def analyze_errors(code: str, language: str = "Python"):

    prompt = (
        "You are an expert programming debugger and teacher.\n\n"
        "Analyze the following " + language + " code for errors.\n\n"
        "CODE:\n\n"
        "```" + language + "\n"
        + code +
        "\n```\n\n"
        "Find:\n"
        "1. Syntax errors\n"
        "2. Runtime errors\n"
        "3. Logical errors\n"
        "4. Possible bugs\n\n"
        "For every error, explain:\n"
        "- What the error is\n"
        "- Why it happens\n"
        "- How to fix it\n\n"
        "If there are no errors, say: No errors found.\n\n"
        "Explain everything in beginner-friendly language."
    )

    result = await generate_ai_response(prompt)

    return result