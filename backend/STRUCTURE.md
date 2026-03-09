# Yummo Backend - Project Structure

## Overview

Complete FastAPI backend for food delivery platform with MongoDB, JWT authentication, and Stripe payments.

## Directory Structure

```
backend/
├── main.py                      # FastAPI application
├── config.py                    # Configuration management
├── database.py                  # MongoDB connection
├── models.py                    # Database models
├── schemas.py                   # Request/Response schemas
├── security.py                  # JWT & OAuth handlers
├── utils.py                     # Utility functions
├── setup_db.py                  # Database setup & indexing
│
├── routes/
│   ├── __init__.py             # Routes package
│   ├── auth.py                 # Authentication (register, login, refresh)
│   ├── users.py                # User management
│   ├── restaurants.py          # Restaurant & menu management
│   ├── orders.py               # Order management & tracking
│   ├── payments.py             # Stripe payment processing
│   └── admin.py                # Admin operations
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # Pytest configuration
│   └── test_auth.py            # Authentication tests
│
├── requirements.txt            # Python dependencies
├── requirements-dev.txt        # Development dependencies
├── Dockerfile                  # Docker image
├── docker-compose.yml          # Docker Compose setup
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
│
├── README.md                  # Main documentation
├── GETTING_STARTED.md         # Quick start guide
├── FRONTEND_INTEGRATION.md    # Frontend integration guide
└── DEPLOYMENT.md              # Deployment & production guide
```

## Core Files

### Application Files
- **main.py**: FastAPI app initialization, CORS, route registration
- **config.py**: Settings management with Pydantic
- **database.py**: MongoDB async connection with Motor
- **security.py**: JWT token handling, password hashing, auth dependency

### Data Files
- **models.py**: MongoDB document models (User, Restaurant, Order, etc.)
- **schemas.py**: Request/Response Pydantic schemas for validation
- **utils.py**: Helper functions (validation, calculations, search)

### Route Handlers
- **routes/auth.py**: Register, login, refresh token, get current user
- **routes/users.py**: Get profile, update profile
- **routes/restaurants.py**: List, create, update restaurants and menu items
- **routes/orders.py**: Create, read, update, track orders
- **routes/payments.py**: Stripe payment intent, webhooks, refunds
- **routes/admin.py**: Dashboard stats, user verification, status updates

### Configuration
- **Dockerfile**: Production Docker image with Python 3.11
- **docker-compose.yml**: MongoDB + FastAPI stack
- **.env.example**: All required environment variables
- **requirements.txt**: Python package dependencies

### Testing
- **tests/conftest.py**: Pytest fixtures and test database setup
- **tests/test_auth.py**: Authentication endpoint tests

### Documentation
- **README.md**: Complete documentation and API reference
- **GETTING_STARTED.md**: Setup instructions and first API calls
- **FRONTEND_INTEGRATION.md**: React/TS integration examples
- **DEPLOYMENT.md**: Production deployment guides

## Key Features

### Authentication ✅
- JWT token-based auth
- Google OAuth ready
- Refresh token mechanism
- Password hashing with bcrypt
- Role-based access control

### Restaurant Management ✅
- Create/update restaurants (vendor)
- Add/manage menu items
- Search by city, cuisine, rating
- Opening hours management

### Order System ✅
- Create orders with items
- Order status tracking
- Delivery address validation
- Order history
- Special instructions

### Payment Processing ✅
- Stripe integration
- Payment intent creation
- Webhook handling
- Refund processing
- Payment status tracking

### Admin Features ✅
- Dashboard statistics
- User verification
- Order status management
- Restaurant activation/deactivation

## Database Collections

1. **users**: Customer, vendor, admin accounts
2. **restaurants**: Restaurant profiles and details
3. **menu_items**: Restaurant menu items
4. **orders**: Customer orders with items
5. **reviews**: Restaurant ratings and reviews
6. **payments**: Payment transaction records

## API Endpoints

### Authentication (7 endpoints)
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/google/callback
- GET /auth/me

### Users (2 endpoints)
- GET /users/{user_id}
- PUT /users/profile/update

### Restaurants (5 endpoints)
- GET /restaurants/
- GET /restaurants/{id}
- POST /restaurants/
- PUT /restaurants/{id}
- POST /restaurants/{id}/menu-items

### Orders (5 endpoints)
- POST /orders/
- GET /orders/
- GET /orders/{id}
- PUT /orders/{id}
- GET /orders/{id}/tracking

### Payments (3 endpoints)
- POST /payments/create-intent
- POST /payments/webhook
- POST /payments/refund/{order_id}

### Admin (5 endpoints)
- GET /admin/stats
- GET /admin/users
- PUT /admin/orders/{id}/status
- POST /admin/users/{id}/verify
- POST /admin/restaurants/{id}/toggle

## Environment Variables

```env
MONGODB_URL              # MongoDB connection string
DATABASE_NAME            # Database name
SECRET_KEY              # JWT signing key (32+ chars)
ALGORITHM               # JWT algorithm (HS256)
ACCESS_TOKEN_EXPIRE_MINUTES     # Token expiration (30)
REFRESH_TOKEN_EXPIRE_DAYS       # Refresh expiration (7)
GOOGLE_CLIENT_ID        # Google OAuth ID
GOOGLE_CLIENT_SECRET    # Google OAuth secret
STRIPE_SECRET_KEY       # Stripe API secret
STRIPE_PUBLISHABLE_KEY  # Stripe public key
DEBUG                   # Debug mode
BACKEND_CORS_ORIGINS    # CORS whitelist
```

## Dependencies

### Core Dependencies
- fastapi==0.104.1
- uvicorn[standard]==0.24.0
- motor==3.3.2
- pymongo==4.6.0

### Authentication
- python-jose[cryptography]==3.3.0
- passlib[bcrypt]==1.7.4
- bcrypt==4.1.1

### Data Validation
- pydantic==2.5.0
- pydantic-settings==2.1.0
- pydantic-extra-types==2.4.1

### Payments
- stripe==7.4.0

### Development
- pytest==7.4.3
- pytest-asyncio==0.21.1
- black==23.12.0
- flake8==6.1.0

## Getting Started

### Quick Start
```bash
cd backend
docker-compose up -d
# Visit http://localhost:8000/docs
```

### Manual Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python setup_db.py
uvicorn main:app --reload
```

## Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test
pytest tests/test_auth.py
```

## Production Deployment

Options:
1. Docker (recommended)
2. Heroku
3. AWS Elastic Beanstalk
4. DigitalOcean App Platform

See DEPLOYMENT.md for detailed instructions.

## Development Workflow

1. Make changes in routes/
2. Update schemas if needed
3. Run `pytest` to test
4. Format with `black .`
5. Lint with `flake8 .`
6. Commit and push

## Monitoring & Logging

- Sentry for error tracking
- Azure Application Insights
- PM2 for process management
- Nginx reverse proxy

## Security Features

- JWT token authentication
- Password hashing (bcrypt)
- CORS configuration
- Input validation (Pydantic)
- SQL injection prevention (MongoDB)
- Rate limiting ready
- HTTPS support

## Performance Features

- Async/await throughout
- MongoDB indexes
- Connection pooling
- Caching ready
- Query optimization

## API Documentation

- Available at: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI spec: http://localhost:8000/openapi.json

## Support & Documentation

- Main: README.md
- Quick Start: GETTING_STARTED.md
- Frontend: FRONTEND_INTEGRATION.md
- Deployment: DEPLOYMENT.md

## File Sizes

- Core files: ~2KB each
- Routes files: ~5-10KB each
- Total backend: ~200KB

## Build Time

- Docker build: ~2-3 minutes
- Install dependencies: ~30-60 seconds
- Database setup: ~5 seconds

## Next Steps

1. Configure .env with your settings
2. Run `docker-compose up -d`
3. Visit http://localhost:8000/docs
4. Create test user
5. Integrate with frontend
6. Configure Stripe for payments
7. Setup deployment pipeline

---

**Status**: ✅ Complete and ready for development
**Version**: 1.0.0
**Last Updated**: March 2025
