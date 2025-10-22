# Elevate - Youth Athlete Performance Tracking Platform

A comprehensive platform for youth athletes (ages 8-18) to track game stats, training sessions, set goals, generate AI insights, and share progress with parents and coaches.

## 🏗️ Project Structure

```
/
├── frontend/              # React + Vite frontend
├── backend/               # FastAPI backend
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Settings and environment
│   ├── database.py       # MongoDB connection
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment variables template
├── Backend-dev-plan.md   # Detailed backend development plan
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- MongoDB Atlas account
- Git

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv ../.venv
source ../.venv/bin/activate  # On Windows: ..\.venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

5. Update `.env` with your MongoDB Atlas connection string and other settings

6. Run the backend server:
```bash
uvicorn main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📋 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Player Profiles**: Create and manage athlete profiles
- **Game Stats Tracking**: Log and analyze game performance
- **Training Sessions**: Track practice sessions and drills
- **Goals Management**: Set and monitor performance goals
- **AI Insights**: Generate weekly/monthly performance summaries
- **Share Links**: Create shareable progress reports for coaches/parents

## 🛠️ Technology Stack

### Backend
- FastAPI (Python web framework)
- Motor (Async MongoDB driver)
- Pydantic v2 (Data validation)
- Argon2 (Password hashing)
- PyJWT (JWT authentication)
- MongoDB Atlas (Database)

### Frontend
- React 18
- TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- shadcn/ui components

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔒 Environment Variables

Required environment variables (see `backend/.env.example`):

- `APP_ENV` - Environment (development/production)
- `PORT` - HTTP port (default: 8000)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Token signing key (min 32 chars)
- `JWT_EXPIRES_IN` - JWT expiration in seconds
- `CORS_ORIGINS` - Allowed frontend URLs

## 📖 Development Plan

See [`Backend-dev-plan.md`](Backend-dev-plan.md) for the complete sprint-based development plan.

### Sprint Status

- ✅ **S0**: Environment Setup & Frontend Connection
- ⏳ **S1**: Basic Auth (Signup/Login/Logout)
- ⏳ **S2**: Player Profile Management
- ⏳ **S3**: Game Stats Tracking
- ⏳ **S4**: Training Sessions Tracking
- ⏳ **S5**: Goals Management
- ⏳ **S6**: AI Insights Generation
- ⏳ **S7**: Share Links & Public Reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- Built with FastAPI and React
- UI components from shadcn/ui
- Icons from Lucide React