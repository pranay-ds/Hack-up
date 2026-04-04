from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from api.routes import router

app = FastAPI(
    title="Fraud Detection API",
    description="Real-time financial fraud detection API",
    version="1.0.0"
)

cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allow_all_origins = cors_origins_env.strip() == "*"
cors_origins = ["*"] if allow_all_origins else [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=not allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("api.app:app", host="0.0.0.0", port=8000, reload=True)
