/**
 * logger.ts
 * 
 * Logger subsystem implementation. This module allows logging events based on the 
 * required level of logging.
 */
import pc from 'picocolors';

export type LoggerConfig = {
    cli: string[];
}

/**
 * Logger class definition
 */
class Logger {
    loggerConfig: LoggerConfig;

    /**
     * Class constructor
     */
    constructor() {
        // Default configuration
        this.loggerConfig = {
            cli: ['INF', 'WRN', 'ERR', 'DBG']
        }
    }


    /**
     * setup()
     * 
     * Configure the logger. If any part of the configuration is not specified,
     * keep the default configuration.
     * 
     * @param logcfg Logger configuration object
     * 
     */
    setup = (logcfg: LoggerConfig): void => {
        if(logcfg.cli) {
            this.loggerConfig.cli = logcfg.cli;
        }
    }


    /**
     * raw()
     * 
     * Display a message based on its level
     * 
     * @param lvl Level of the message to be displayed
     * @param msg Message to display
     */
    raw = (lvl: string, module: string, msg: string): void => {
        const nowDate: string = new Date(Date.now()).toISOString().split('T').join(" ");
        const plainMsg: string = `${lvl} | ${nowDate} | [${module}]: ${msg}`;
        let coloredMsg;

        switch(lvl) {
            case 'WRN': {
                coloredMsg = pc.yellow(plainMsg);
                break;
            }
            
            case 'ERR': {
                coloredMsg = pc.red(plainMsg);
                break;
            }
            
            case 'DBG': {
                coloredMsg = pc.cyan(plainMsg);
                break;
            }

            default: {
                coloredMsg = plainMsg;
                break;
            }
        }

        // Display message only if the display level is configured
        if(this.loggerConfig.cli.includes(lvl)) {
            console.log(coloredMsg);
        }
    }

    /**
     * Display an INFO message
     * 
     * @param msg Message to be displayed
     */
    info = (module: string, msg: string): void => {
        this.raw('INF', module, msg);
    }

    /**
     * Display an INFO message
     * 
     * @param msg Message to be displayed
     */
    warn = (module: string, msg: string): void => {
        this.raw('WRN', module, msg);
    }

    /**
     * Display an INFO message
     * 
     * @param msg Message to be displayed
     */
    error = (module: string, msg: string): void => {
        this.raw('ERR', module, msg);
    }

    /**
     * Display an INFO message
     * 
     * @param msg Message to be displayed
     */
    debug = (module: string, msg: string): void => {
        this.raw('DBG', module, msg);
    }
}

export const logger = new Logger();
