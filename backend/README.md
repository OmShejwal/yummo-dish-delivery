# Yummo Delivery Backend API

A comprehensive FastAPI backend for a food delivery platform with MongoDB, JWT authentication, and Stripe payment integration.

## Features

- ✅ **User Management** - Register, login, profile management
- ✅ **Multi-Method Authentication** - JWT tokens and Google OAuth
- ✅ **Restaurant Management** - Create and manage restaurants and menus
- ✅ **Order Management** - Create, track, and manage orders
- ✅ **Payment Integration** - Stripe payment processing
- ✅ **Role-Based Access** - Customer, Vendor, Admin roles
- ✅ **Real-time Tracking** - Order status tracking
- ✅ **Async Operations** - Fast, non-blocking API

## Tech Stack

- **Framework**: FastAPI
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT + Google OAuth
- **Payment**: Stripe API
- **Deployment**: Docker & Docker Compose
- **Server**: Uvicorn

## Installation

### Prerequisites
- Python 3.11+
- MongoDB 4.4+
- Docker & Docker Compose (optional)

### Local Setup

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7.0
```

6. **Start the server**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000 for the API and http://localhost:8000/docs for interactive API documentation.

## Docker Setup

Run the entire stack with Docker Compose:

```bash
docker-compose up -d
```

This will:
- Start MongoDB on port 27017
- Start FastAPI backend on port 8000
- Setup networking between services

Access the API at http://localhost:8000

## API Documentation

### Authentication Endpoints

#### Register
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "full_name": "John Doe",
  "role": "customer"
}
```

#### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### Get Current User
```bash
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### Restaurant Endpoints

#### List Restaurants
```bash
GET /api/v1/restaurants/?city=Austin&cuisine_type=Italian&skip=0&limit=10
```

#### Get Restaurant Details
```bash
GET /api/v1/restaurants/{restaurant_id}
```

#### Create Restaurant (Vendor)
```bash
POST /api/v1/restaurants/
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "name": "Pizza Palace",
  "description": "Best pizzas in town",
  "cuisine_types": ["Italian", "Fast Food"],
  "address": "123 Main St",
  "city": "Austin",
  "phone": "+1234567890",
  "email": "info@pizzapalace.com",
  "opening_hours": {
    "monday": {"open": "10:00", "close": "22:00"},
    "tuesday": {"open": "10:00", "close": "22:00"}
  },
  "delivery_fee": 2.99,
  "min_order_value": 15.00
}
```

#### Add Menu Item (Vendor)
```bash
POST /api/v1/restaurants/{restaurant_id}/menu-items
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato, mozzarella, and basil",
  "price": 12.99,
  "category": "Pizza",
  "preparation_time": 20,
  "dietary_info": ["vegetarian"]
}
```

### Order Endpoints

#### Create Order
```bash
POST /api/v1/orders/
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "restaurant_id": "64abc123def456",
  "items": [
    {
      "menu_item_id": "64abc456def789",
      "quantity": 2,
      "special_instructions": "Extra cheese"
    }
  ],
  "delivery_address": "456 Oak Ave",
  "delivery_city": "Austin",
  "delivery_postal_code": "78701",
  "payment_method": "card"
}
```

#### Get User Orders
```bash
GET /api/v1/orders/?status=pending&skip=0&limit=10
Authorization: Bearer <customer_token>
```

#### Get Order Details
```bash
GET /api/v1/orders/{order_id}
Authorization: Bearer <customer_token>
```

#### Track Order
```bash
GET /api/v1/orders/{order_id}/tracking
Authorization: Bearer <customer_token>
```

### Payment Endpoints

#### Create Payment Intent
```bash
POST /api/v1/payments/create-intent
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "order_id": "64abc123def456",
  "amount": 35.99,
  "currency": "usd"
}
```

Response:
```json
{
  "client_secret": "pi_1234567890_secret_abcdef",
  "publishable_key": "pk_live_..." 
}
```

#### Refund Order
```bash
POST /api/v1/payments/refund/{order_id}
Authorization: Bearer <customer_token>
```

### User Endpoints

#### Get User Profile
```bash
GET /api/v1/users/{user_id}
```

#### Update Profile
```bash
PUT /api/v1/users/profile/update
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "John Updated",
  "phone": "+1234567890",
  "address": "789 New St",
  "city": "Austin",
  "postal_code": "78701"
}
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  username: String,
  password_hash: String,
  full_name: String,
  phone: String,
  role: String, // "customer", "vendor", "admin"
  profile_image: String,
  address: String,
  city: String,
  postal_code: String,
  google_id: String,
  is_active: Boolean,
  is_verified: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

### Restaurants Collection
```javascript
{
  _id: ObjectId,
  vendor_id: ObjectId,
  name: String,
  description: String,
  logo_url: String,
  banner_url: String,
  cuisine_types: [String],
  rating: Number,
  reviews_count: Number,
  address: String,
  city: String,
  phone: String,
  email: String,
  opening_hours: Object,
  is_active: Boolean,
  delivery_fee: Number,
  min_order_value: Number,
  created_at: DateTime,
  updated_at: DateTime
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  restaurant_id: ObjectId,
  items: [
    {
      menu_item_id: ObjectId,
      quantity: Number,
      price: Number,
      special_instructions: String
    }
  ],
  status: String, // "pending", "confirmed", "preparing", etc.
  subtotal: Number,
  delivery_fee: Number,
  tax: Number,
  total: Number,
  delivery_address: String,
  delivery_city: String,
  delivery_postal_code: String,
  special_instructions: String,
  estimated_delivery_time: Number,
  payment_status: String,
  payment_method: String,
  stripe_payment_id: String,
  created_at: DateTime,
  updated_at: DateTime,
  delivered_at: DateTime
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=yummo_delivery

# JWT
SECRET_KEY=your-very-secret-key-min-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# API
DEBUG=True
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── database.py            # MongoDB connection
├── models.py              # Pydantic models
├── schemas.py             # Request/Response schemas
├── security.py            # JWT and OAuth handlers
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
├── .env.example          # Environment variables template
├── routes/
│   ├── __init__.py
│   ├── auth.py           # Authentication endpoints
│   ├── users.py          # User management endpoints
│   ├── restaurants.py    # Restaurant endpoints
│   ├── orders.py         # Order management endpoints
│   └── payments.py       # Payment processing endpoints
└── test/                 # Test files (optional)
```

## Development

### Running Tests
```bash
pytest
```

### Code Quality
```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t yummo-backend .

# Run container
docker run -p 8000:8000 \
  -e MONGODB_URL=mongodb://mongo:27017 \
  -e SECRET_KEY=your-secret-key \
  yummo-backend
```

### Production Considerations

1. **Security**
   - Use strong SECRET_KEY
   - Enable HTTPS
   - Set secure CORS origins
   - Use environment-specific configurations

2. **Database**
   - Setup MongoDB authentication
   - Configure backups
   - Use connection pooling

3. **Monitoring**
   - Setup logging
   - Monitor API performance
   - Track error rates

4. **Rate Limiting**
   - Implement rate limiting
   - Add request throttling

## API Response Format

### Success Response
```json
{
  "data": {...},
  "success": true
}
```

### Error Response
```json
{
  "detail": "Error message",
  "status_code": 400
}
```

## Support & Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **GitHub**: [Repository URL]
- **Issues**: Report bugs and feature requests

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Advanced search and filtering
- [ ] Real-time order notifications
- [ ] Delivery partner integration
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Rating and review system
- [ ] Loyalty program
- [ ] Admin dashboard API

## Future Enhancements

- WebSocket support for real-time updates
- Redis caching layer
- Message queue for async tasks
- GraphQL API
- Mobile app backend
