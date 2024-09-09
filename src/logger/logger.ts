/**
 * logger.ts
 * 
 * Logger subsystem implementation. This module allows logging events based on the 
 * required level of logging.
 */
import winston from "winston";
import 'winston-daily-rotate-file';
import { cfg } from "../cfg";
import MySQLTransport from "./MySQLTransport.ts";


// Custom logging format for both Console and File
const customFormat = winston.format.printf(({ level, message, timestamp, module }) => {
    const tmp = (module?module:"SYS");

    return `${timestamp} | ${tmp} | ${level}: ${message}`;
});

// Build up the transports list based on cfg
const txportList = [];
txportList.push(
    new winston.transports.Console({
        level: 'debug',
        silent: cfg.logSilent,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize({all: true}),
            customFormat
        )
    })
);

if (cfg.logFileLevel!=='none') {
    txportList.push(
        new winston.transports.DailyRotateFile({
            level: cfg.logFileLevel,
            filename: 'piggybank-%DATE%.log',
            datePattern: 'YYY-MM-DD-HH',
            maxSize: '20m',
            dirname: cfg.logDir,
            format: winston.format.combine(
                winston.format.timestamp(),
                customFormat
            )
        })
    );
}

if (cfg.logDBLevel!=='none') {
    txportList.push(
        new MySQLTransport({
            level: cfg.logDBLevel,
            host: cfg.dbHost,
            port: cfg.dbPort || 3306,
            user: cfg.dbUser,
            password: cfg.dbPass,
            database: cfg.dbName,
            table: cfg.logDBTable,
            format: winston.format.timestamp()
        })
    );
}

// Create the logger object to be shared
const parentLogger = winston.createLogger({
    transports: txportList
});

export default parentLogger;