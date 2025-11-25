/**
 * Environment configuration
 * Centralized configuration management with type safety
 */

interface EnvConfig {
  apiUrl: string;
  oauthLoginUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  appName: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  let result = value || defaultValue || '';
  
  // Force HTTPS in production for API URLs (security requirement)
  if (import.meta.env.PROD && result.startsWith('http://') && !result.includes('localhost')) {
    console.warn(`⚠️ Warning: ${key} was using HTTP, forcing HTTPS for production`);
    result = result.replace('http://', 'https://');
  }
  
  return result;
}

export const config: EnvConfig = {
  // apiUrl: getEnvVar('VITE_API_URL', 'http://localhost:8081'),
  apiUrl: getEnvVar('VITE_API_URL', 'https://luxury-fashion-backend-818617016504.us-central1.run.app'),
  // oauthLoginUrl: getEnvVar('VITE_OAUTH_LOGIN_URL', 'http://localhost:8081/oauth2/authorization/google'),
  oauthLoginUrl: getEnvVar('VITE_OAUTH_LOGIN_URL', 'https://luxury-fashion-backend-818617016504.us-central1.run.app/oauth2/authorization/google'),
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  appName: getEnvVar('VITE_APP_NAME', 'Luxury Fashion'),
};

// Debug: Log the API URL being used (both development and production)
console.log('🔧 Backend API URL:', config.apiUrl);
console.log('🔧 Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🔧 Is Production:', config.isProduction);
console.log('🔧 Is Development:', config.isDevelopment);










