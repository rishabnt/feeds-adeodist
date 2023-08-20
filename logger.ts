import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const transport: DailyRotateFile = new DailyRotateFile ({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    frequency: '5m',
    maxSize: '20m',
    maxFiles: '30m'
})

const logger = winston.createLogger ({
    transports: [transport]
});

logger.info("Logging logs!")

module.exports = logger;