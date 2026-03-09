# Getting Started with Yummo Backend

This guide will help you get the Yummo Delivery backend up and running locally.

## Quick Start (5 minutes)

### Using Docker (Recommended)

```bash
# Navigate to backend directory
cd backend

# Create .env file
cp .env.example .env

# Start all services
docker-compose up -d

# Setup database indexes
docker-compose exec backend python setup_db.py
```

Visit http://localhost:8000/docs to test the API.

### Local Setup (Manual)

#### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

#### 2. Setup MongoDB

**Option A: Docker**
```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:7.0
```

**Option B: Local Installation**
- Download MongoDB from https://www.mongodb.com/try/download/community
- Install and run MongoDB

#### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
MONGODB_URL=mongodb://admin:password@localhost:27017
SECRET_KEY=your-very-secret-key-min-32-chars
DEBUG=True
```

#### 4. Setup Database Indexes

```bash
python setup_db.py
```

#### 5. Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## First API Calls

### 1. Register a User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "full_name": "John Doe",
    "role": "customer"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### 2. Save Your Token

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 3. Get Current User

```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Create a Restaurant (as vendor)

First register as vendor:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@example.com",
    "username": "vendor",
    "password": "VendorPass123!",
    "full_name": "Restaurant Owner",
    "role": "vendor"
  }'
```

Then create restaurant:
```bash
export VENDOR_TOKEN="eyJhbGciOiJIUzI1NiIs..."

curl -X POST "http://localhost:8000/api/v1/restaurants/" \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delicious Pizza",
    "description": "Best pizza in town",
    "cuisine_types": ["Italian", "Pizza"],
    "address": "123 Main St",
    "city": "Austin",
    "phone": "+12015551234",
    "email": "pizza@example.com",
    "opening_hours": {
      "monday": {"open": "10:00", "close": "22:00"},
      "tuesday": {"open": "10:00", "close": "22:00"},
      "wednesday": {"open": "10:00", "close": "22:00"},
      "thursday": {"open": "10:00", "close": "22:00"},
      "friday": {"open": "10:00", "close": "23:00"},
      "saturday": {"open": "11:00", "close": "23:00"},
      "sunday": {"open": "11:00", "close": "21:00"}
    },
    "delivery_fee": 3.99,
    "min_order_value": 15.00
  }'
```

## Development Tasks

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=.

# Specific test file
pytest tests/test_auth.py

# Verbose output
pytest -v
```

### Code Quality

```bash
# Format code
black .

# Check formatting
black . --check

# Lint
flake8 .

# Type checking
mypy .

# Sort imports
isort .
```

### Database Maintenance

```bash
# Reset database (remove all collections)
python -c "
import asyncio
from motor.motor_asyncio import AsyncClient
from config import get_settings

async def reset_db():
    settings = get_settings()
    client = AsyncClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    await db.client.drop_database(settings.DATABASE_NAME)
    print('Database reset')
    client.close()

asyncio.run(reset_db())
"
```

## Common Issues & Solutions

### MongoDB Connection Error

**Problem**: `pymongo.errors.ServerSelectionTimeoutError`

**Solution**:
1. Verify MongoDB is running: `mongosh`
2. Check connection string in `.env`
3. Verify username/password if using auth

### Port Already in Use

**Problem**: `Address already in use`

**Solution**:
```bash
# Linux/Mac: Find process on port 8000
lsof -i :8000
# Kill process
kill -9 <PID>

# Windows: Find process on port 8000
netstat -ano | findstr :8000
# Kill process
taskkill /PID <PID> /F
```

### Secret Key Too Short

**Problem**: `ValueError: Secret key too short`

**Solution**: Set `SECRET_KEY` to at least 32 characters in `.env`

### Module Not Found

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**: Reinstall dependencies
```bash
pip install -r requirements.txt
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | MongoDB database name | `yummo_delivery` |
| `SECRET_KEY` | JWT signing key (min 32 chars) | Required |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | `30` |
| `STRIPE_SECRET_KEY` | Stripe secret key | Required for payments |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `DEBUG` | Debug mode | `False` |

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Read the documentation**: Check [API_DOCS.md](./API_DOCS.md)
3. **Connect frontend**: Follow [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)
4. **Setup payments**: Configure Stripe in [PAYMENTS.md](./PAYMENTS.md)
5. **Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Support

- **Documentation**: [README.md](./README.md)
- **API Reference**: http://localhost:8000/docs
- **Issues**: Check existing GitHub issues

## Tips & Tricks

### Using Postman

1. Import `postman-collection.json` (if provided)
2. Set environment variables in Postman
3. Use the pre-built requests

### Using curl

```bash
# Save responses to file
curl -X GET "http://localhost:8000/api/v1/restaurants/" > restaurants.json

# Pretty print JSON
curl -s "http://localhost:8000/api/v1/restaurants/" | jq .
```

### Using HTTPie

```bash
# Install
pip install httpie

# Make requests
http GET http://localhost:8000/api/v1/restaurants/

# With authentication
http GET http://localhost:8000/api/v1/auth/me \
  Authorization:"Bearer $TOKEN"
```

## Performance Monitoring

```bash
# Monitor API in real-time
watch 'curl -s http://localhost:8000/health | jq .'

# Check MongoDB performance
# In MongoDB shell
db.stats()
db.restaurants.stats()
```

---

**Questions?** Check the [README.md](./README.md) or create an issue!
