from services.gemini_service import generate_ai_response


async def chat_with_ai(
    question: str,
    code: str,
    language: str = "Python"
):

    prompt = f"""
You are an expert programming tutor.

The user is learning {language} programming.

CURRENT CODE:

{code}

USER QUESTION:

{question}

Instructions:

1. Answer the user's question directly.
2. Explain the answer in a beginner-friendly way.
3. Use the current code when explaining.
4. If the code contains an error related to the question, explain it.
5. If appropriate, provide corrected code.
6. Explain why the correction works.
7. Do not discuss unrelated topics.

Give a clear and useful answer.
"""

    try:

        result = await generate_ai_response(prompt)

        return result

    except Exception as e:

        print("========== CHAT SERVICE ERROR ==========")
        print(str(e))

        raise
