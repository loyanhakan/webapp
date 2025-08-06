# 🤖 Telegram Mini App Backend API

Modern, secure backend API for Telegram Mini Apps with JWT authentication, PostgreSQL database, and comprehensive user management.

## 🚀 Features

- **🔐 JWT Authentication** - Secure token-based authentication
- **📱 Telegram Web App Integration** - Full Telegram Mini App support
- **🗄️ PostgreSQL Database** - Robust data storage with Neon.tech
- **🛡️ Security** - Rate limiting, CORS, Helmet security headers
- **📊 Activity Logging** - Comprehensive user activity tracking
- **🔄 Session Management** - Automatic session cleanup
- **⚡ Performance** - Optimized database queries and connection pooling

## 🛠️ Tech Stack

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Neon.tech)
- **Authentication:** JWT + bcryptjs
- **Security:** Helmet, CORS, Rate Limiting
- **Deployment:** Railway
- **Monitoring:** Morgan logging

## 📋 Prerequisites

- Node.js (v10.0.0 or higher)
- PostgreSQL database (Neon.tech recommended)
- Telegram Bot Token
- Railway account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd webapp
npm install
```

### 2. Environment Setup

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Update `.env` with your credentials:

```env
# Telegram Bot
BOT_TOKEN=your_bot_token_here
BOT_USERNAME=@your_bot_username

# Database
DATABASE_URL=your_neon_database_url_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# App Settings
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### 3. Database Setup

The application will automatically create the required tables on first run. Make sure your PostgreSQL database is accessible.

### 4. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

## 📚 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API status and information |
| `GET` | `/health` | Health check |
| `POST` | `/api/telegram/validate` | Validate Telegram Web App init data |
| `POST` | `/api/auth/login` | Authenticate user with Telegram data |

### Protected Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/protected` | Example protected route |
| `GET` | `/api/user/profile` | Get user profile |
| `POST` | `/api/auth/logout` | Logout user |

## 🔐 Authentication

### Login Flow

1. **Validate Telegram Data:**
   ```bash
   POST /api/telegram/validate
   {
     "initData": "telegram_init_data_string"
   }
   ```

2. **Authenticate User:**
   ```bash
   POST /api/auth/login
   {
     "initData": "telegram_init_data_string"
   }
   ```

3. **Use JWT Token:**
   ```bash
   GET /api/protected
   Authorization: Bearer <jwt_token>
   ```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10),
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### User Activity Table
```sql
CREATE TABLE user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Deployment

### Railway Deployment

1. **Connect to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy:**
   ```bash
   railway up
   ```

3. **Set Environment Variables:**
   - Go to Railway dashboard
   - Add all variables from `.env` file

### Environment Variables for Production

```env
NODE_ENV=production
CORS_ORIGIN=https://your-railway-app.railway.app
```

## 📱 Telegram Mini App Setup

1. **Create Bot with @BotFather:**
   ```
   /newbot
   ```

2. **Set Web App URL:**
   ```
   /setmenubutton
   ```

3. **Configure Mini App:**
   - Web App URL: `https://your-railway-app.railway.app`
   - Title: Your App Name
   - Description: Your App Description

## 🔧 Development

### Project Structure

```
webapp/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── database/
│   └── schema.sql        # Database schema
├── utils/
│   ├── database.js       # Database utilities
│   ├── auth.js          # Authentication utilities
│   └── telegram.js      # Telegram validation utilities
└── public/
    └── index.html        # Testing interface
```

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (not implemented yet)
```

### Database Operations

The application includes comprehensive database utilities:

- **User Management:** Create, update, retrieve users
- **Session Management:** Create, validate, cleanup sessions
- **Activity Logging:** Track user actions and system events

## 🛡️ Security Features

- **JWT Token Validation** - Secure token-based authentication
- **Rate Limiting** - Prevent abuse with request limits
- **CORS Protection** - Configured for secure cross-origin requests
- **Helmet Security** - Security headers for Express.js
- **Input Validation** - Validate all incoming data
- **SQL Injection Protection** - Parameterized queries
- **Session Management** - Secure session storage and cleanup

## 📊 Monitoring & Logging

- **Morgan Logging** - HTTP request logging
- **Activity Tracking** - User action logging
- **Error Handling** - Comprehensive error management
- **Health Checks** - System health monitoring

## 🔄 Session Management

- **Automatic Cleanup** - Expired sessions removed hourly
- **Token Hashing** - Secure token storage in database
- **Session Validation** - Real-time session verification

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔮 Future Enhancements

- [ ] User roles and permissions
- [ ] Advanced analytics
- [ ] Webhook support
- [ ] Multi-language support
- [ ] Push notifications
- [ ] File upload handling
- [ ] Real-time features with WebSocket

---

**Built with ❤️ for Telegram Mini Apps** 