from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ==========================
# Import Routers
# ==========================

from routes.analyze import router as analyze_router
from routes.chat import router as chat_router
from routes.errors import router as errors_router
from routes.algorithm import router as algorithm_router
from auth.auth import router as auth_router
from routes.run import router as run_router
from routes.dashboard import router as dashboard_router
from routes.learning import router as learning_router
# ==========================
# Create FastAPI App
# ==========================

app = FastAPI(
    title="AI Code Tutor Studio API",
    version="1.0.0"
)

# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# Register Routers
# ==========================

app.include_router(analyze_router)
app.include_router(chat_router)
app.include_router(errors_router)
app.include_router(algorithm_router)
app.include_router(auth_router)
app.include_router(run_router)
app.include_router(dashboard_router)
app.include_router(learning_router)

# ==========================
# Home Route
# ==========================

@app.get("/")
async def home():
    return {
        "status": "success",
        "message": "AI Code Tutor Studio Backend Running"
    }

# ==========================
# Health Check
# ==========================

@app.get("/health")
async def health():
    return {
        "server": "online"
    }

