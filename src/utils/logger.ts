import ILogger from "./ILogger"
import chalk from 'chalk'

class ConsoleLogger implements ILogger {

    private logInternal(message: any) {
        const timestamp = new Date().toISOString()
        return console.log(`[${chalk.bold(timestamp)}] ${message}`)
    }

    logMessage(message: any): void {
        return this.logInternal(chalk.green(message))
    }

    warnMessage(message: any): void {
        return this.logInternal(chalk.yellow(message))
    }

    errorMessage(message: any): void {
        return this.logInternal(chalk.red(message))
    }

}

const consoleLogger = new ConsoleLogger()
export default consoleLogger