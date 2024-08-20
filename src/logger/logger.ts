/**
 * logger.ts
 * 
 * Logger subsystem implementation. This module allows logging events based on the 
 * required level of logging.
 */
import winston from "winston";
import 'winston-daily-rotate-file';
import { cfg } from "../cfg";


const myFormat = winston.format.printf(({ level, message, timestamp, module }) => {
    const tmp = (module?module:"SYS");

    return `${timestamp} | ${module} | ${level}: ${message}`;
})

const sql_options = {
}

const parentLogger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            silent: cfg.logSilent,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize({all: true}),
                myFormat
            ),
        }),

        new winston.transports.DailyRotateFile({
            level: 'warn',
            filename: 'piggybank-%DATE%.log',
            datePattern: 'YYY-MM-DD-HH',
            maxSize: '20m',
            dirname: cfg.logDir,
            format: winston.format.combine(
                winston.format.timestamp(),
                myFormat
            ),
        }),

        // new MySQLTransport({
        //     level: 'debug',
        //     host: cfg.dbHost,
        //     user: cfg.dbUser,
        //     password: cfg.dbPass,
        //     database: "piggybank_admin",
        //     table: "logger"
        // })
    ]
});

export default parentLogger;