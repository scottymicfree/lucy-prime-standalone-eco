from fastapi import FastAPI
from .routes import router

app = FastAPI(title="Lucy Mobile API")
app.include_router(router)\n