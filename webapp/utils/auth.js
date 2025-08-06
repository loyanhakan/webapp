const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'telegram-mini-app',
      audience: 'telegram-users'
    });
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw error;
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'telegram-mini-app',
      audience: 'telegram-users'
    });
  } catch (error) {
    console.error('Error verifying JWT token:', error);
    throw error;
  }
};

// Hash token for database storage
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Create user payload for JWT
const createUserPayload = (user) => {
  return {
    userId: user.id,
    telegramId: user.telegram_id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    isPremium: user.is_premium
  };
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    // Get user from database
    const { userOperations, sessionOperations } = require('./database');
    const user = await userOperations.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
    }

    // Check if session is still active
    const tokenHash = hashToken(token);
    const session = await sessionOperations.getActiveSession(tokenHash);
    
    if (!session) {
      return res.status(401).json({
        error: 'Session expired',
        message: 'Your session has expired. Please login again'
      });
    }

    // Add user and session to request
    req.user = user;
    req.session = session;
    req.tokenHash = tokenHash;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'The provided token has expired'
      });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: 'An error occurred during authentication'
      });
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    // Try to authenticate
    const decoded = verifyToken(token);
    const { userOperations, sessionOperations } = require('./database');
    const user = await userOperations.getUserById(decoded.userId);
    
    if (user) {
      const tokenHash = hashToken(token);
      const session = await sessionOperations.getActiveSession(tokenHash);
      
      if (session) {
        req.user = user;
        req.session = session;
        req.tokenHash = tokenHash;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    next();
  }
};

// Rate limiting helper
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(ip)) {
      requests.set(ip, requests.get(ip).filter(time => time > windowStart));
    } else {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);
    
    if (userRequests.length >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    userRequests.push(now);
    next();
  };
};

module.exports = {
  generateToken,
  verifyToken,
  hashToken,
  generateRefreshToken,
  createUserPayload,
  authenticateToken,
  optionalAuth,
  createRateLimiter
}; 