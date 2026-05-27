/**
 * Simple logger utility for the application.
 * In a production environment, this would be replaced with a proper logging library like winston or pino.
 */
export class Logger {
  /**
   * Log an info message
   * @param message - The message to log
   * @param optionalParams - Optional parameters to include in the log
   */
  public static info(message: string, ...optionalParams: any[]): void {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] ${message}`, ...optionalParams);
  }

  /**
   * Log a warning message
   * @param message - The message to log
   * @param optionalParams - Optional parameters to include in the log
   */
  public static warn(message: string, ...optionalParams: any[]): void {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] [${timestamp}] ${message}`, ...optionalParams);
  }

  /**
   * Log an error message
   * @param message - The message to log
   * @param optionalParams - Optional parameters to include in the log
   */
  public static error(message: string, ...optionalParams: any[]): void {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] ${message}`, ...optionalParams);
  }

  /**
   * Log a debug message (only in development)
   * @param message - The message to log
   * @param optionalParams - Optional parameters to include in the log
   */
  public static debug(message: string, ...optionalParams: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      console.log(`[DEBUG] [${timestamp}] ${message}`, ...optionalParams);
    }
  }
}