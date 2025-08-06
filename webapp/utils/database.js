const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully:', result.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    const client = await pool.connect();
    await client.query(schema);
    client.release();
    
    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    return false;
  }
};

// User operations
const userOperations = {
  // Create or update user
  upsertUser: async (telegramData) => {
    const { id, username, first_name, last_name, language_code, is_premium } = telegramData;
    
    const query = `
      INSERT INTO users (telegram_id, username, first_name, last_name, language_code, is_premium)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (telegram_id) 
      DO UPDATE SET 
        username = EXCLUDED.username,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        language_code = EXCLUDED.language_code,
        is_premium = EXCLUDED.is_premium,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [id, username, first_name, last_name, language_code, is_premium];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error('Error upserting user:', err);
      throw err;
    }
  },

  // Get user by telegram ID
  getUserByTelegramId: async (telegramId) => {
    const query = 'SELECT * FROM users WHERE telegram_id = $1';
    
    try {
      const result = await pool.query(query, [telegramId]);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error getting user:', err);
      throw err;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error getting user by ID:', err);
      throw err;
    }
  }
};

// Session operations
const sessionOperations = {
  // Create session
  createSession: async (userId, tokenHash, expiresAt) => {
    const query = `
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [userId, tokenHash, expiresAt]);
      return result.rows[0];
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  },

  // Get active session
  getActiveSession: async (tokenHash) => {
    const query = `
      SELECT s.*, u.* 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.token_hash = $1 AND s.is_active = true AND s.expires_at > NOW()
    `;
    
    try {
      const result = await pool.query(query, [tokenHash]);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error getting session:', err);
      throw err;
    }
  },

  // Invalidate session
  invalidateSession: async (tokenHash) => {
    const query = 'UPDATE sessions SET is_active = false WHERE token_hash = $1';
    
    try {
      await pool.query(query, [tokenHash]);
      return true;
    } catch (err) {
      console.error('Error invalidating session:', err);
      throw err;
    }
  },

  // Clean expired sessions
  cleanExpiredSessions: async () => {
    const query = 'DELETE FROM sessions WHERE expires_at < NOW()';
    
    try {
      const result = await pool.query(query);
      console.log(`🧹 Cleaned ${result.rowCount} expired sessions`);
      return result.rowCount;
    } catch (err) {
      console.error('Error cleaning sessions:', err);
      throw err;
    }
  }
};

// Activity logging
const activityOperations = {
  logActivity: async (userId, action, details = {}, ipAddress = null, userAgent = null) => {
    const query = `
      INSERT INTO user_activity (user_id, action, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    try {
      await pool.query(query, [userId, action, JSON.stringify(details), ipAddress, userAgent]);
    } catch (err) {
      console.error('Error logging activity:', err);
      // Don't throw error for activity logging failures
    }
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  userOperations,
  sessionOperations,
  activityOperations
}; 