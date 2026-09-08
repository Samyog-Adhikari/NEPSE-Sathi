from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.logging import logger

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": str(exc) if request.app.debug else "An unexpected error occurred."
        }
    )
