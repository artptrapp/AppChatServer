export default interface ILogger {
    /**
     * Logs a message with timestamp
     */
    logMessage(message: any): void

    /**
     * Logs a message with timestamp and a warning style
     */
    warnMessage(message: any): void

    /**
     * Logs a message with timestamp and an error style
     */
    errorMessage(message: any): void
}