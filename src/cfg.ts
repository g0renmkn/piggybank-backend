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
    server_port: process.env.SRV_PORT || 4343,
    db_host: process.env.DB_HOST || "localhost",
    db_port: process.env.DB_PORT || 3306,
    db_user: process.env.DB_USER || "user",
    db_pass: process.env.DB_PASS || "pass",
    db_name: process.env.DB_NAME || "database",
    logdir: process.env.LOGDIR || "/tmp"
};


