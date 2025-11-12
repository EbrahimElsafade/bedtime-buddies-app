/**
 * Sanitizes error messages for display to users
 * Prevents leaking sensitive information in error messages
 */
export const sanitizeErrorMessage = (error: unknown): string => {
  if (!error) return 'An unexpected error occurred';
  
  const message = error instanceof Error ? error.message : String(error);
  
  // Map of technical errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please verify your email address',
    'User already registered': 'An account with this email already exists',
    'Invalid email': 'Please enter a valid email address',
    'Password should be at least 6 characters': 'Password must be at least 6 characters',
    'Network request failed': 'Connection error. Please check your internet connection',
    'Failed to fetch': 'Connection error. Please try again',
  };
  
  // Check for exact matches
  if (errorMappings[message]) {
    return errorMappings[message];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(errorMappings)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  // For any other error, return a generic message
  // This prevents leaking database schema, API endpoints, or other sensitive info
  return 'An error occurred. Please try again';
};

/**
 * Type for error log level
 */
export type LogLevel = 'error' | 'warn' | 'info';

/**
 * Safe error logger that respects environment
 * Only logs detailed errors in development
 */
export const logError = (error: unknown, context?: string, level: LogLevel = 'error') => {
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    const prefix = context ? `[${context}]` : '';
    console[level](`${prefix} Error:`, error);
  }
  
  // In production, you would send to a logging service instead
  // Example: Sentry, LogRocket, etc.
};
