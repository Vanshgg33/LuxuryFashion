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
  return value || defaultValue || '';
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










