# Verdustry Backend API

Professional carbon emissions tracking and sustainability platform backend.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- MySQL 5.7+
- pip or conda

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd Verdustry-backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   - Copy `.env` and update with your settings:
   ```bash
   cp .env.example .env
   ```

5. **Initialize database:**
   ```bash
   python init_db.py
   ```

6. **Start server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

API available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

## 📋 API Endpoints

### Authentication
- `POST /register` - Register new business
- `POST /login` - login user
- `POST /upload-profile-picture` - Upload profile picture

### Emissions
- `POST /add-emission` - Create emission record
- `GET /recent-logs/{business_id}` - Get recent emissions
- `PUT /update-emission/{emission_id}` - Update emission
- `DELETE /delete-emission/{emission_id}` - Delete emission
- `PATCH /update-emission-status/{emission_id}` - Update status

### Analytics
- `GET /dashboard-stats/{business_id}` - Dashboard statistics
- `GET /category-breakdown/{business_id}` - Emissions by type
- `GET /monthly-trends/{business_id}` - Monthly trends

### Exports
- `GET /export-data/{business_id}` - Export CSV
- `GET /export-pdf/{business_id}` - Export PDF

### Chat
- `POST /start-chat` - Start chat session
- `POST /send-chat-message` - Send message
- `POST /send-support-ticket` - Send support ticket

### Health
- `GET /health` - Health check

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database
DATABASE_URL=mysql+mysqlconnector://user:pass@localhost:3306/Verdustry_db
DATABASE_ECHO=false

# API
API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=production
DEBUG=false

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google APIs
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CHAT_SPACE_ID=spaces/YOUR_SPACE_ID
GEMINI_API_KEY=your-gemini-api-key

# Upload
MAX_UPLOAD_SIZE_MB=10
UPLOAD_DIR=uploads

# OCR
# Default engine is Tesseract. Install the Tesseract binary on the host OS and either add it to PATH
# or set the full path (Windows example shown).
OCR_ENGINE=tesseract
TESSERACT_CMD=C:\\Program Files\\Tesseract-OCR\\tesseract.exe
TESSERACT_LANGUAGES=eng+fra+ara
OCR_PDF_MAX_PAGES=2

# Optional PaddleOCR (higher accuracy on some invoices/tables)
# 1) Install: pip install -r requirements-ocr-paddle.txt
# 2) Set: OCR_ENGINE=paddle
PADDLE_OCR_LANGS=fr ar
PADDLE_PDF_MAX_PAGES=2

# Logging
LOG_LEVEL=INFO
```

## 📂 Project Structure

```
Verdustry-backend/
├── main.py                 # FastAPI application & routes
├── database.py            # Database configuration
├── models.py              # SQLAlchemy models
├── config.py              # Settings management
├── auth_utils.py          # Password hashing/verification
├── carbon_utils.py        # Emission calculations
├── role_models.py         # Role & permission models
├── role_routes.py         # Role management routes
├── role_utils.py          # Role utility functions
├── chatbot_service.py     # Google Chat integration
├── ai_chatbot.py          # AI response generation
├── init_db.py             # Database initialization
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## 🛠️ Development

### Run with watch mode:
```bash
uvicorn main:app --reload
```

### Run tests:
```bash
pytest
```

### Code quality:
```bash
black .
pylint Verdustry-backend/
flake8
```

## 📊 Database

### Initialize:
```bash
python init_db.py
```

### Reset (development only):
```bash
python reset_db.py
```

### Tables
- `users` - Business accounts
- `emissions` - Emission records
- `roles` - User roles
- `permissions` - System permissions
- `user_roles` - User-role associations
- `role_permissions` - Role-permission associations

## 🔐 Security

- Passwords hashed with bcrypt
- Case-insensitive email handling
- Input validation with Pydantic
- CORS configured for frontend
- Rate limiting (optional)
- SQL injection prevention via SQLAlchemy ORM

## 📝 API Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed",
  "data": {}
}
```

### Error Response
```json
{
  "detail": "Error description"
}
```

## 🚨 Error Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `413` - Payload Too Large
- `500` - Server Error

## 🤝 Contributing

1. Follow PEP 8 style guide
2. Add docstrings to all functions
3. Use type hints
4. Test your changes
5. Update documentation

## 📄 License

Proprietary - Verdustry Inc.
