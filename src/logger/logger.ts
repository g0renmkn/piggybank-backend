/**
 * logger.ts
 * 
 * Logger subsystem implementation. This module allows logging events based on the 
 * required level of logging.
 */
import winston from "winston";

const myFormat = winston.format.printf(({ level, message, timestamp, module }) => {
    const tmp = (module?module:"SYS");

    return `${timestamp} | ${module} | ${level}: ${message}`;
})

const parentLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize({all: true}),
                myFormat
            ),
        })
    ]
});

export default parentLogger;