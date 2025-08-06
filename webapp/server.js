const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import utilities
const { testConnection, initializeDatabase, userOperations, sessionOperations, activityOperations } = require('./utils/database');
const { generateToken, createUserPayload, authenticateToken, createRateLimiter } = require('./utils/auth');
const { validateInitData, isInitDataRecent } = require('./utils/telegram');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Rate limiting
const rateLimiter = createRateLimiter(15 * 60 * 1000, 100); // 15 minutes, 100 requests
app.use(rateLimiter);

// Initialize database
const initializeApp = async () => {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }

    // Initialize database schema
    const isInitialized = await initializeDatabase();
    if (!isInitialized) {
      console.error('❌ Failed to initialize database schema');
      process.exit(1);
    }

    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    process.exit(1);
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Telegram Mini App API is running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Telegram Web App validation endpoint
app.post('/api/telegram/validate', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({
        error: 'initData is required'
      });
    }

    // Validate Telegram init data
    const validation = validateInitData(initData);
    
    if (!validation.isValid) {
      return res.status(401).json({
        error: 'Invalid init data',
        message: validation.error
      });
    }

    // Check if init data is recent
    if (!isInitDataRecent(initData)) {
      return res.status(401).json({
        error: 'Expired init data',
        message: 'Init data is too old. Please refresh the app.'
      });
    }

    res.json({
      success: true,
      message: 'Telegram Web App validation successful',
      user: validation.user
    });
  } catch (error) {
    console.error('Telegram validation error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// User authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({
        error: 'initData is required'
      });
    }

    // Validate Telegram init data
    const validation = validateInitData(initData);
    
    if (!validation.isValid) {
      return res.status(401).json({
        error: 'Invalid init data',
        message: validation.error
      });
    }

    // Check if init data is recent
    if (!isInitDataRecent(initData)) {
      return res.status(401).json({
        error: 'Expired init data',
        message: 'Init data is too old. Please refresh the app.'
      });
    }

    // Create or update user in database
    const user = await userOperations.upsertUser(validation.user);
    
    // Generate JWT token
    const userPayload = createUserPayload(user);
    const token = generateToken(userPayload);
    
    // Store session in database
    const { hashToken } = require('./utils/auth');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    await sessionOperations.createSession(user.id, tokenHash, expiresAt);
    
    // Log activity
    await activityOperations.logActivity(
      user.id, 
      'login', 
      { method: 'telegram_webapp' },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      token: token,
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        isPremium: user.is_premium
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Protected route example
app.get('/api/protected', authenticateToken, async (req, res) => {
  try {
    // Log activity
    await activityOperations.logActivity(
      req.user.id,
      'access_protected_route',
      { route: '/api/protected' },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'This is a protected route',
      data: {
        user: {
          id: req.user.id,
          telegramId: req.user.telegram_id,
          username: req.user.username,
          firstName: req.user.first_name,
          lastName: req.user.last_name,
          isPremium: req.user.is_premium
        },
        session: {
          id: req.session.id,
          expiresAt: req.session.expires_at
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Protected route error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // Invalidate session
    await sessionOperations.invalidateSession(req.tokenHash);
    
    // Log activity
    await activityOperations.logActivity(
      req.user.id,
      'logout',
      { method: 'api' },
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// User profile endpoint
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        telegramId: req.user.telegram_id,
        username: req.user.username,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        isPremium: req.user.is_premium,
        languageCode: req.user.language_code,
        createdAt: req.user.created_at,
        updatedAt: req.user.updated_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Bot: ${process.env.BOT_USERNAME}`);
  
  // Initialize application
  await initializeApp();
  
  // Clean expired sessions every hour
  setInterval(async () => {
    try {
      await sessionOperations.cleanExpiredSessions();
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
});

module.exports = app; 