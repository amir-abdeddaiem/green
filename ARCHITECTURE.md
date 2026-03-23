# Verdustry Architecture

Comprehensive system architecture documentation for the Verdustry sustainability platform.

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)            │
│                     http://localhost:5173                    │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API (HTTP/CORS)
┌────────────────────────────▼────────────────────────────────┐
│              Backend API (FastAPI + Python)                  │
│              http://localhost:8000                           │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                    │
│  • Authentication (/login, /register)                      │
│  • Emissions Management (/add-emission, /update, /delete)  │
│  • Analytics (/dashboard-stats, /monthly-trends)           │
│  • Exports (/export-data, /export-pdf)                     │
│  • Chat (/start-chat, /send-message)                       │
│  • Roles & Permissions (/api/roles, /api/permissions)      │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL Queries
┌────────────────────────────▼────────────────────────────────┐
│           Database (MySQL 5.7+)                             │
│           Verdustry_db                                     │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Technology Stack

### Frontend
- **Framework:** React 18+
- **Language:** TypeScript
- **Build Tool:** Vite
- **CSS:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **State:** LocalStorage
- **HTTP:** Fetch API
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI 0.104+
- **Server:** Uvicorn / Gunicorn
- **Language:** Python 3.8+
- **ORM:** SQLAlchemy 2.0+
- **Database:** MySQL 5.7+
- **Auth:** Bcrypt + JWT (optional)
- **File Upload:** Python Multipart
- **PDF:** ReportLab
- **AI:** Google Generative AI (optional)
- **Chat:** Google Chat API (optional)

## 🗂️ Project Structure

### Backend
```
Verdustry-backend/
├── main.py                 # FastAPI app, routes
├── database.py            # DB config, session management
├── models.py              # SQLAlchemy models (User, Emission)
├── schemas.py             # Pydantic schemas
├── config.py              # Settings management
├── auth_utils.py          # Password hashing/verification
├── carbon_utils.py        # Emissions calculations
├── role_models.py         # Role/Permission models
├── role_routes.py         # Role management API
├── role_utils.py          # Role utility functions
├── chatbot_service.py     # Google Chat integration
├── ai_chatbot.py          # AI response generation
├── init_db.py             # Database initialization script
├── reset_db.py            # Database reset script
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── .env.example           # Example env file
├── .gitignore            # Git ignore rules
└── README.md             # Documentation
```

### Frontend
```
Verdustry-frontend/
├── src/
│   ├── App.tsx                    # Main app component
│   ├── main.tsx                   # Entry point
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterCard.tsx
│   │   │   │   └── AuthScreen.tsx
│   │   │   ├── services/
│   │   │   │   └── authService.ts
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── dashboard/
│   │       ├── components/
│   │       │   ├── DashboardLayout.tsx
│   │       │   ├── DashboardOverview.tsx
│   │       │   ├── ChatWidget.tsx
│   │       │   ├── tabs/
│   │       │   │   ├── AnalyticsTab.tsx
│   │       │   │   ├── EmissionsLogTab.tsx
│   │       │   │   ├── ReportsTab.tsx
│   │       │   │   ├── SettingsTab.tsx
│   │       │   │   ├── GoalsTab.tsx
│   │       │   │   ├── SupportTab.tsx
│   │       │   │   └── RoleManagementTab.tsx
│   │       ├── services/
│   │       │   └── chatService.ts
│   │       └── hooks/
│   │           └── usePermissions.ts
│   ├── components/
│   │   └── ui/
│   │       └── [shadcn components]
│   ├── lib/
│   │   └── utils.ts
│   └── pages/
│       └── HomePage.tsx
├── public/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Emissions Table
```sql
CREATE TABLE emissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_id INT NOT NULL,
  type VARCHAR(50) NOT NULL,           -- Electricity, Natural Gas, Fuel, Waste
  value FLOAT NOT NULL,                -- Raw measurement
  unit VARCHAR(20) NOT NULL,           -- kWh, m3, Liters
  co2_impact FLOAT NOT NULL,           -- Calculated CO2e
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Roles Table
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Permissions Table
```sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relationship Tables
```sql
CREATE TABLE user_roles (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE role_permissions (
  role_id INT,
  permission_id INT,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

## 🔄 Data Flow

### User Registration
```
Frontend Form
    ↓
authService.register()
    ↓
POST /register (UserCreate)
    ↓
Backend: Hash password + validate
    ↓
INSERT INTO users
    ↓
Return: user_id + message
    ↓
Frontend: Store in localStorage
```

### Emission Logging
```
Frontend: Add Emission Form
    ↓
POST /add-emission (EmissionCreate)
    ↓
Backend: Calculate CO2 impact
    ↓
INSERT INTO emissions
    ↓
Return: impact + id
    ↓
Frontend: Update dashboard
```

### Analytics
```
Frontend: Request stats
    ↓
GET /dashboard-stats/{business_id}
    ↓
Backend: SQL aggregations
    ↓
Return: JSON statistics
    ↓
Frontend: Render charts
```

## 🔐 Security Architecture

### Password Security
- Bcrypt hashing with salt
- 72-byte limit (bcrypt standard)
- Case-insensitive email matching

### Input Validation
- Pydantic models with constraints
- Email validation (EmailStr)
- Min/max length enforcement
- Type checking

### Database Security
- SQL injection prevention (ORM)
- Connection pooling
- Prepared statements
- Foreign key constraints

### API Security
- CORS configuration
- Error handling (no sensitive info)
- Logging (audit trail)
- Status codes (401/403/404/500)

## 📊 API Response Format

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

### Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 413 | Payload Too Large |
| 500 | Server Error |

## 🚀 API Endpoints

### Authentication
- `POST /register` - Register business
- `POST /login` - Login user
- `POST /upload-profile-picture` - Upload picture

### Emissions
- `POST /add-emission` - Create record
- `GET /recent-logs/{id}` - Recent logs
- `PUT /update-emission/{id}` - Update record
- `DELETE /delete-emission/{id}` - Delete record
- `PATCH /update-emission-status/{id}` - Update status

### Analytics
- `GET /dashboard-stats/{id}` - Dashboard stats
- `GET /category-breakdown/{id}` - Breakdown by type
- `GET /monthly-trends/{id}` - Monthly trends

### Exports
- `GET /export-data/{id}` - Export as CSV
- `GET /export-pdf/{id}` - Export as PDF

### Chat
- `POST /start-chat` - Start session
- `POST /send-chat-message` - Send message
- `POST /send-support-ticket` - Support ticket

### Health
- `GET /health` - Health check

## 🔄 Authentication Flow

```
1. User enters credentials
2. Frontend: POST /login
3. Backend: Hash + compare password
4. Success: Return user_id, business_name
5. Frontend: Store in localStorage
6. Subsequent requests use user_id
7. Protected routes check localStorage
```

## 🎯 Role-Based Access Control (RBAC)

### Default Roles
- **Admin**: Full access
- **Manager**: Manage team, emissions, reports
- **Team Lead**: Create and view emissions/reports
- **Analyst**: View-only access
- **Viewer**: Limited dashboard access

### Permission Categories
- Emissions (view, create, edit, delete)
- Reports (view, create, edit, delete, export)
- Goals (view, create, edit, delete)
- Analytics (view, advanced access)
- Settings (view, edit, manage team, manage roles)
- Users (view, create, edit, delete, assign roles)
- Dashboard (access)

## 📈 Performance Optimization

### Backend
- Connection pooling (QueuePool)
- Query optimization
- Index on business_id
- Pagination support
- Response compression

### Frontend
- Code splitting
- Lazy loading components
- Memoization (React.memo)
- Image optimization
- CSS-in-JS optimization

### Database
- Indexes on frequently queried columns
- Denormalization where needed
- Efficient aggregations
- Query result caching

## 🔍 Monitoring & Logging

### Backend Logging
- Request/response logging
- Error logging with stack traces
- Performance metrics
- User action logging

### Frontend Logging
- Console errors/warnings
- API call logging
- User interactions
- Performance metrics

### Database Monitoring
- Slow query log
- Connection pool status
- Query execution time
- Table sizes

## 🚀 Deployment Considerations

### Environment Stages
- **Development**: DEBUG=true, verbose logging
- **Staging**: DEBUG=false, production-like
- **Production**: DEBUG=false, optimized

### Load Balancing
- Nginx reverse proxy
- Multiple API instances
- Session affinity
- Health checks

### Caching Strategy
- HTTP caching headers
- Database query cache
- Redis (optional)
- CDN for frontend

## 📚 API Documentation

Available at: `http://localhost:8000/docs` (Swagger UI)

Auto-generated from:
- Endpoint docstrings
- Pydantic model descriptions
- Type hints
- Example responses
