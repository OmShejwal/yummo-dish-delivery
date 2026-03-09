# Payment Integration & Deployment Guide

## Stripe Payment Setup

### 1. Create Stripe Account

1. Go to https://stripe.com
2. Sign up for a free account
3. Go to Dashboard → API Keys
4. Copy your keys

### 2. Configure Environment Variables

Add to `.env`:

```env
STRIPE_SECRET_KEY=sk_test_51HwHJXDx1dPqF8CHQ...
STRIPE_PUBLISHABLE_KEY=pk_test_51HwHJXDx1dPq...
```

### 3. Webhook Setup

1. Go to Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/v1/payments/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy Webhook Signing Secret

4. Add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_1HwHJXDx1dPqF8CHQ...
```

### 4. Test Payments

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Expiry: Any future date
CVC: Any 3 digits

## Deployment

### Option 1: Docker (Recommended)

#### Build Image

```bash
docker build -t yummo-backend:latest .
```

#### Push to Registry

```bash
# Docker Hub
docker tag yummo-backend:latest username/yummo-backend:latest
docker push username/yummo-backend:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag yummo-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/yummo-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/yummo-backend:latest
```

### Option 2: Heroku

#### Prerequisites

```bash
# Install Heroku CLI
brew install heroku

# Login
heroku login
```

#### Deploy

```bash
# Create app
heroku create yummo-backend

# Add buildpack
heroku buildpacks:add heroku/python

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set MONGODB_URL=mongodb://user:pass@host:port/db

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 3: AWS Elastic Beanstalk

#### Setup

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p python-3.11 yummo-backend

# Create environment
eb create yummo-production

# Configure environment variables
eb setenv \
  SECRET_KEY=your-secret-key \
  MONGODB_URL=mongodb://user:pass@host:port/db \
  DEBUG=False
```

#### Deploy

```bash
eb deploy
eb open
```

### Option 4: DigitalOcean App Platform

#### Create App

1. Go to DigitalOcean Control Panel
2. Apps → Create App
3. Connect GitHub repo
4. Configure:
   - **Build command**: `pip install -r requirements.txt`
   - **Run command**: `uvicorn main:app --host 0.0.0.0 --port 8080`

#### Set Environment Variables

In App spec or dashboard:
```yaml
env:
  - key: SECRET_KEY
    value: ${SECRET_KEY}
  - key: MONGODB_URL
    value: ${MONGODB_URL}
  - key: DEBUG
    value: "False"
```

## Production Checklist

- [ ] Set `DEBUG = False` in `.env`
- [ ] Generate strong `SECRET_KEY` (32+ characters)
- [ ] Configure CORS origins properly
- [ ] Setup MongoDB backups
- [ ] Enable MongoDB authentication
- [ ] Configure Stripe webhook signing
- [ ] Setup monitoring/logging
- [ ] Configure rate limiting
- [ ] Setup HTTPS/SSL
- [ ] Configure domain name
- [ ] Setup email notifications
- [ ] Configure error tracking (Sentry)
- [ ] Setup CI/CD pipeline

## Nginx Configuration

Deploy behind Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name api.yummodelivery.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSL redirect
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yummodelivery.com;

    ssl_certificate /etc/letsencrypt/live/api.yummodelivery.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yummodelivery.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## PM2 Configuration

Run with PM2 for process management:

```bash
# Install PM2
npm install -g pm2

# Add ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "yummo-backend",
    script: "./run.sh",
    instances: "max",
    exec_mode: "cluster",
    env: {
      MONGODB_URL: "mongodb://user:pass@host/db",
      SECRET_KEY: "your-secret-key",
      DEBUG: false
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z"
  }]
};
EOF

# Start
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

## Logging & Monitoring

### Sentry Setup

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
)
```

### Application Insights (Azure)

```python
from opencensus.ext.azure.trace_exporter import AzureExporter

trace_exporter = AzureExporter(
    connection_string="InstrumentationKey=..."
)
```

## Database Backup

### MongoDB Atlas (Recommended)

1. Use MongoDB Atlas for managed backups
2. Automated backups every 6-8 hours
3. Point-in-time recovery available

### Manual Backup

```bash
# Backup
mongodump --uri "mongodb://user:pass@host:27017/yummo_delivery" \
  --out /backups/yummo_$(date +%Y%m%d_%H%M%S)

# Restore
mongorestore --uri "mongodb://user:pass@host:27017" \
  /backups/yummo_20240101_120000
```

## Performance Optimization

### Caching with Redis

```python
import aioredis

redis = None

async def get_redis():
    global redis
    if not redis:
        redis = await aioredis.create_redis_pool('redis://localhost:6379')
    return redis

@app.get("/restaurants/")
async def list_restaurants_cached(cache: aioredis.Redis = Depends(get_redis)):
    key = "restaurants:all"
    
    # Try cache
    cached = await cache.get(key)
    if cached:
        return json.loads(cached)
    
    # Get from DB
    restaurants = await db.restaurants.find({}).to_list(100)
    
    # Cache for 1 hour
    await cache.setex(key, 3600, json.dumps(restaurants))
    
    return restaurants
```

### Database Indexing

See `setup_db.py` for index creation.

### Query Optimization

```python
# Use projections to limit fields
restaurants = await db.restaurants.find(
    {"city": "Austin"},
    projection={"name": 1, "rating": 1}  # Only these fields
).limit(10)

# Use aggregation for complex queries
pipeline = [
    {"$match": {"city": "Austin"}},
    {"$group": {"_id": "$cuisine_types", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]
results = await db.restaurants.aggregate(pipeline).to_list(10)
```

## CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.11
      - run: pip install -r requirements.txt
      - run: pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: yummo-backend
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

## Troubleshooting

### Out of Memory

```bash
# Check memory usage
docker stats yummo_backend

# Increase memory limit
docker run -m 2g yummo-backend
```

### Database Connection Issues

```bash
# Check MongoDB logs
docker logs yummo_mongodb

# Check network
docker network inspect yummo_network
```

### Slow Requests

```python
# Add timing middleware
from time import time

@app.middleware("http")
async def add_process_time_header(request, call_next):
    start_time = time()
    response = await call_next(request)
    process_time = time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

---

**Questions?** Check the [README.md](./README.md) or create an issue!
