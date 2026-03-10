# Yummo Dish Delivery

A full-stack food delivery platform built with React, TypeScript, FastAPI, and MongoDB.

## Features

- 🍕 **Restaurant Management** - Browse restaurants and menus
- 🛒 **Shopping Cart** - Add items to cart and manage orders
- 👤 **User Authentication** - Register, login, and manage profiles
- 📍 **Order Tracking** - Real-time order status updates
- 💳 **Payment Integration** - Secure payments with Stripe
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- React Router for navigation

### Backend
- FastAPI (Python)
- MongoDB with Motor
- JWT authentication
- Stripe payment processing
- Google OAuth integration

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB

### Quick Access Links

After starting the development servers, you can access the application using these convenient methods:

#### 🌐 **Web Links**
- **Frontend (Web)**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

#### 🛠️ **Quick Launch Scripts**
Run these commands from the project root:

```bash
# Open development dashboard (recommended)
.\web.bat          # Windows batch file
.\web.ps1 -Dashboard  # PowerShell script

# Direct access to services
.\web.ps1 -Frontend   # Open React frontend
.\web.ps1 -Backend    # Open FastAPI backend
.\web.ps1 -Docs       # Open API documentation
```

#### 📁 **Files Created**
- `web.html` - Development dashboard with all links
- `web.bat` - Windows batch launcher
- `web.ps1` - PowerShell launcher
- `Yummo Frontend.url` - Desktop shortcut (on Desktop)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd yummo-dish-delivery
```

2. **Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
# Setup MongoDB and environment variables
```

3. **Setup Frontend**
```bash
npm install
```

4. **Run the application**
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
npm run dev
```

Visit http://localhost:8080 for the frontend and http://localhost:8000/docs for API documentation.

## Project Structure

```
yummo-dish-delivery/
├── backend/                 # FastAPI backend
│   ├── routes/             # API endpoints
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   └── main.py             # Application entry point
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utilities
└── public/                 # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
