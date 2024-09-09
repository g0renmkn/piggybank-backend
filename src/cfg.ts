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

export const cfg = {
    serverPort: process.env.SRV_PORT || 4343,
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: Number(process.env.DB_PORT || 3306),
    dbUser: process.env.DB_USER || "user",
    dbPass: process.env.DB_PASS || "pass",
    dbName: process.env.DB_NAME || "database",
    logDir: process.env.LOG_DIR || "/tmp",
    logSilent: (process.env.LOG_SILENT!=="1"?false:true),
    logFileLevel: process.env.LOG_FILE_LEVEL || "warn",
    logDBLevel: process.env.LOG_DB_LEVEL || "info"
};


