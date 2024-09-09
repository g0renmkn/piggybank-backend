import {config} from "dotenv";

// Check the environment we are running (test, dev, or other)
if (process.env.BUN_ENV=="test" || process.env.BUN_ENV=="dev") {
    console.log(`[CONFIG]: Loading '.env.${process.env.BUN_ENV}'...`);
    config({
        path: `./.env.${process.env.BUN_ENV}`, 
        override: true
    });
}
else {
    console.log('[CONFIG] Loading default env file');
    config();
}

// Default values for DBs
// (same defaults for API and Logger DBs unless specified)
const defDBValues = {
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: Number(process.env.DB_PORT || 3306),
    dbUser: process.env.DB_USER || "user",
    dbPass: process.env.DB_PASS || "pass",
    dbName: process.env.DB_NAME || "database",
}

export const cfg = {
    serverPort: process.env.SRV_PORT || 4343,
    dbHost: defDBValues.dbHost,
    dbPort: defDBValues.dbPort,
    dbUser: defDBValues.dbUser,
    dbPass: defDBValues.dbPass,
    dbName: defDBValues.dbName,
    logDir: process.env.LOG_DIR || "/tmp",
    logDBHost: process.env.LOG_DB_HOST || defDBValues.dbHost,
    logDBPort: process.env.LOG_DB_PORT || defDBValues.dbPort,
    logDBUser: process.env.LOG_DB_USER || defDBValues.dbUser,
    logDBPass: process.env.LOG_DB_PASS || defDBValues.dbPass,
    logDBName: process.env.LOG_DB_NAME || defDBValues.dbName,
    logDBTable: process.env.LOG_DB_TABLE || "logger",
    logSilent: (process.env.LOG_SILENT!=="1"?false:true),
    logFileLevel: process.env.LOG_FILE_LEVEL || "warn",
    logDBLevel: process.env.LOG_DB_LEVEL || "info"
};


