import pytest
from fastapi import status


@pytest.mark.asyncio
async def test_health_check(client):
    """Test health check endpoint"""
    response = await client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Test root endpoint"""
    response = await client.get("/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "docs" in data


@pytest.mark.asyncio
async def test_user_registration(client, test_user_data):
    """Test user registration"""
    response = await client.post(
        "/api/v1/auth/register",
        json=test_user_data
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_user_registration_duplicate_email(client, test_user_data):
    """Test registration with duplicate email"""
    # First registration
    await client.post("/api/v1/auth/register", json=test_user_data)
    
    # Second registration with same email
    response = await client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.asyncio
async def test_user_login(client, test_user_data):
    """Test user login"""
    # Register user first
    await client.post("/api/v1/auth/register", json=test_user_data)
    
    # Login
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_user_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
