#!/bin/bash
# Quick setup script for Yummo Backend

set -e

echo "🚀 Yummo Food Delivery - Backend Setup"
echo "======================================"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ backend directory not found!"
    exit 1
fi

cd backend

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env - Please edit with your settings"
else
    echo "✅ .env already exists"
fi

# Create virtual environment if using local setup
if [ "$1" != "docker" ]; then
    echo ""
    echo "📦 Setting up Python virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        echo "✅ Virtual environment created"
    fi
    
    source venv/bin/activate
    
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
    echo "✅ Dependencies installed"
    
    echo ""
    echo "🗄️  Setting up database indexes..."
    python setup_db.py
    echo "✅ Database setup complete"
    
    echo ""
    echo "🎉 Setup complete! Start server with:"
    echo "   uvicorn main:app --reload"
else
    echo ""
    echo "🐳 Docker setup selected"
    echo "📥 Starting Docker containers..."
    docker-compose up -d
    echo "✅ Docker containers started"
    
    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 5
    
    echo "🗄️  Setting up database indexes..."
    docker-compose exec backend python setup_db.py
    echo "✅ Database setup complete"
    
    echo ""
    echo "✅ Docker setup complete!"
    echo "   API available at: http://localhost:8000"
    echo "   Docs at: http://localhost:8000/docs"
fi

echo ""
echo "📚 Documentation:"
echo "   - Getting Started: GETTING_STARTED.md"
echo "   - API Reference: README.md"
echo "   - Frontend Integration: FRONTEND_INTEGRATION.md"
echo "   - Deployment: DEPLOYMENT.md"
echo ""
echo "✨ Backend setup complete! Happy coding! 🎉"
