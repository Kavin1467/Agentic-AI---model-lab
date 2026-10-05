import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, SessionLocal
from .seed_data import seed_database_if_empty
from .routers import expenses, products, chat, seed

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables
    Base.metadata.create_all(bind=engine)
    # Seed large dataset if empty
    db = SessionLocal()
    try:
        seed_result = seed_database_if_empty(db, force=False)
        print(f"Database initialization: {seed_result}")
    finally:
        db.close()
    yield

app = FastAPI(
    title="Apex AI Expense Tracker API",
    description="Full-stack AI Agent powered Expense Tracker with Product Management and Multi-Timeframe Analytics",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React and Flutter (Web, Mobile, Desktop)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(expenses.router)
app.include_router(products.router)
app.include_router(chat.router)
app.include_router(seed.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Apex AI Expense Tracker API",
        "endpoints": [
            "/api/expenses",
            "/api/expenses/history",
            "/api/expenses/stats",
            "/api/products",
            "/api/chat",
            "/docs"
        ]
    }

@app.get("/api/health")
def health():
    return {"status": "healthy"}
