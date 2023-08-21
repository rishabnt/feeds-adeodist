import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const transport: DailyRotateFile = new DailyRotateFile ({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YY-MM-DD-HH-mm',
    frequency: '10s',
    maxSize: '20m',
    maxFiles: '30m'
})

const logger = winston.createLogger ({
    transports: [transport]
});

module.exports = {
    logger: logger
};