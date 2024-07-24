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
    raw = (lvl:number, module: string, msg: string): void => {
        const tags = ['INF', 'WRN', 'ERR', 'DBG'];
        const nowDate: string = new Date(Date.now()).toISOString().split('T').join(" ");
        let totalMsg: string = `${tags[lvl]} | ${nowDate} | [${module}]: ${msg}`;

        switch(lvl) {
            case 1: {
                totalMsg = pc.yellow(totalMsg);
                break;
            }
            
            case 2: {
                totalMsg = pc.red(totalMsg);
                break;
            }
            
            case 3: {
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
        this.raw(0, module, msg);
    }

    /**
     * Display an INFO message
     * 
     * @param msg Message to be displayed
     */
    warn = (module: string, msg: string): void => {
        this.raw(1, module, msg);
    }

    /**
     * Display an INFO message
     * 
     * @param msg Message to be displayed
     */
    error = (module: string, msg: string): void => {
        this.raw(2, module, msg);
    }

    /**
     * Display an INFO message
     * 
     * @param msg Message to be displayed
     */
    debug = (module: string, msg: string): void => {
        this.raw(3, module, msg);
    }
}

export const logger = new Logger();
