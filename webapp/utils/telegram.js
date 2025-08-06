const crypto = require('crypto');

const BOT_TOKEN = process.env.BOT_TOKEN;

// Validate Telegram Web App init data
const validateInitData = (initData) => {
  try {
    if (!initData) {
      throw new Error('Init data is required');
    }

    // Parse init data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      throw new Error('Hash is missing from init data');
    }

    // Remove hash from params for validation
    params.delete('hash');

    // Sort parameters alphabetically
    const sortedParams = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create data check string
    const dataCheckString = sortedParams;

    // Create secret key from bot token
    const secretKey = crypto.createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    // Calculate hash
    const calculatedHash = crypto.createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes
    if (calculatedHash !== hash) {
      throw new Error('Hash validation failed');
    }

    // Parse user data
    const userData = {
      id: parseInt(params.get('user.id')),
      first_name: params.get('user.first_name'),
      last_name: params.get('user.last_name'),
      username: params.get('user.username'),
      language_code: params.get('user.language_code'),
      is_premium: params.get('user.is_premium') === 'true',
      allows_write_to_pm: params.get('user.allows_write_to_pm') === 'true'
    };

    // Validate required fields
    if (!userData.id || !userData.first_name) {
      throw new Error('Invalid user data');
    }

    return {
      isValid: true,
      user: userData,
      auth_date: parseInt(params.get('auth_date')),
      query_id: params.get('query_id'),
      start_param: params.get('start_param')
    };

  } catch (error) {
    console.error('Telegram validation error:', error.message);
    return {
      isValid: false,
      error: error.message
    };
  }
};

// Extract user data from init data
const extractUserData = (initData) => {
  try {
    const params = new URLSearchParams(initData);
    
    return {
      id: parseInt(params.get('user.id')),
      first_name: params.get('user.first_name'),
      last_name: params.get('user.last_name'),
      username: params.get('user.username'),
      language_code: params.get('user.language_code'),
      is_premium: params.get('user.is_premium') === 'true',
      allows_write_to_pm: params.get('user.allows_write_to_pm') === 'true'
    };
  } catch (error) {
    console.error('Error extracting user data:', error);
    return null;
  }
};

// Check if init data is recent (within 1 hour)
const isInitDataRecent = (initData) => {
  try {
    const params = new URLSearchParams(initData);
    const authDate = parseInt(params.get('auth_date'));
    const currentTime = Math.floor(Date.now() / 1000);
    const oneHour = 3600; // 1 hour in seconds

    return (currentTime - authDate) < oneHour;
  } catch (error) {
    console.error('Error checking init data recency:', error);
    return false;
  }
};

// Create Telegram Web App URL
const createWebAppUrl = (botUsername, startParam = '') => {
  const baseUrl = `https://t.me/${botUsername.replace('@', '')}`;
  return startParam ? `${baseUrl}?start=${startParam}` : baseUrl;
};

// Validate bot token format
const validateBotToken = (token) => {
  if (!token) return false;
  
  // Telegram bot token format: <bot_id>:<bot_token>
  const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
  return tokenRegex.test(token);
};

// Get bot info from token
const getBotInfo = (token) => {
  if (!validateBotToken(token)) {
    return null;
  }

  const [botId] = token.split(':');
  return {
    botId: parseInt(botId),
    token: token
  };
};

module.exports = {
  validateInitData,
  extractUserData,
  isInitDataRecent,
  createWebAppUrl,
  validateBotToken,
  getBotInfo
}; 