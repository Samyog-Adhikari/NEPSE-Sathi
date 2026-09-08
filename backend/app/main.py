from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.middleware.error_handler import global_exception_handler
from app.api.v1.api import api_v1_router

setup_logging()

app = FastAPI(
    title="NEPSE Insight API",
    description="Backend service for NEPSE Insight stock market companion platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
app.add_exception_handler(Exception, global_exception_handler)

# Root Health Endpoints
@app.get("/health", tags=["Health"])
async def root_health_check():
    return {
        "status": "ok",
        "app": "NEPSE Insight API",
        "environment": settings.environment
    }

# Include API v1 routes
app.include_router(api_v1_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
