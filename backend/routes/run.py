# ============================================================
# AI CODE TUTOR STUDIO
# routes/run.py
# ============================================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
import sys
import tempfile
import os


router = APIRouter(
    prefix="/run",
    tags=["Run Code"]
)


# ============================================================
# REQUEST MODEL
# ============================================================

class RunRequest(BaseModel):

    code: str

    language: str = "Python"

    # Input provided by the user to input()
    input: str = ""


# ============================================================
# RUN CODE
# ============================================================

@router.post("/")
async def run_code(request: RunRequest):

    print("========== RUN CODE ==========")

    print("Language:")
    print(request.language)

    print("Input:")
    print(request.input)

    print("Code:")
    print(request.code)


    # ========================================================
    # CHECK CODE
    # ========================================================

    if not request.code.strip():

        raise HTTPException(
            status_code=400,
            detail="No code provided"
        )


    # ========================================================
    # CHECK LANGUAGE
    # ========================================================

    if request.language.lower() != "python":

        raise HTTPException(
            status_code=400,
            detail="Currently only Python execution is supported."
        )


    file_path = None


    try:

        # ====================================================
        # CREATE TEMPORARY PYTHON FILE
        # ====================================================

        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8"
        ) as file:

            file.write(request.code)

            file_path = file.name


        # ====================================================
        # EXECUTE PYTHON
        # ====================================================

        process = subprocess.run(

            [
                sys.executable,
                file_path
            ],

            # IMPORTANT:
            # This sends the frontend input
            # to Python's input()
            input=request.input,

            capture_output=True,

            text=True,

            timeout=5
        )


        stdout = process.stdout

        stderr = process.stderr


        # ====================================================
        # PROGRAM ERROR
        # ====================================================

        if process.returncode != 0:

            print(
                "========== PROGRAM ERROR =========="
            )

            print(stderr)


            return {

                "success": False,

                "output": stdout,

                "error": stderr

            }


        # ====================================================
        # SUCCESS
        # ====================================================

        print(
            "========== PROGRAM OUTPUT =========="
        )

        print(stdout)


        return {

            "success": True,

            "output": stdout,

            "error": ""

        }


    # ========================================================
    # TIMEOUT
    # ========================================================

    except subprocess.TimeoutExpired:

        return {

            "success": False,

            "output": "",

            "error":
                "Program execution timed out."

        }


    # ========================================================
    # OTHER ERROR
    # ========================================================

    except Exception as e:

        print(
            "========== RUN ERROR =========="
        )

        print(str(e))


        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


    # ========================================================
    # DELETE TEMP FILE
    # ========================================================

    finally:

        if (
            file_path
            and
            os.path.exists(file_path)
        ):

            os.remove(file_path)