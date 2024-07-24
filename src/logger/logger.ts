import pc from 'picocolors';

class Logger {
    /**
     * Class constructor
     */
    constructor() {
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
        const tags = ['INF', 'WRN', 'ERR', 'DBG'];
        const nowDate: string = new Date(Date.now()).toISOString().split('T').join(" ");
        let totalMsg: string = `${lvl} | ${nowDate} | [${module}]: ${msg}`;

        switch(lvl) {
            case 'WRN': {
                totalMsg = pc.yellow(totalMsg);
                break;
            }
            
            case 'ERR': {
                totalMsg = pc.red(totalMsg);
                break;
            }
            
            case 'DBG': {
                totalMsg = pc.cyan(totalMsg);
                break;
            }

            default: {
                break;
            }
        }

        console.log(totalMsg);
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
