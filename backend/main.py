from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import get_settings
from database import Database
from routes import auth, users, restaurants, orders, payments, admin

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app startup and shutdown"""
    # Startup
    await Database.connect_db()
    print("✅ Application started successfully")
    yield
    # Shutdown
    await Database.close_db()
    print("🛑 Application shutdown")


# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(
    auth.router,
    prefix=settings.API_V1_STR,
)
app.include_router(
    users.router,
    prefix=settings.API_V1_STR,
)
app.include_router(
    restaurants.router,
    prefix=settings.API_V1_STR,
)
app.include_router(
    orders.router,
    prefix=settings.API_V1_STR,
)
app.include_router(
    payments.router,
    prefix=settings.API_V1_STR,
)
app.include_router(
    admin.router,
    prefix=settings.API_V1_STR,
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Yummo Delivery API",
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
