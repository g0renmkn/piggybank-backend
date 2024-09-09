/**
 * MySQLTransport.ts
 * 
 * This file contains a modified and customized piece of code based on the 
 * original Winston MySQL Transport module written by charles-zh.
 * 
 * Original license disclaimer can be found in this very same directory, 
 * in the file named 'LICENSE'.
 */
import Transport from 'winston-transport';
import mysql, { type PoolConnection, type ResultSetHeader } from 'mysql2';


type MySQLOptionsType = {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    table?: string;
} & Transport.TransportStreamOptions;


/**
 * MySQLTransport class definition
 */
class MySQLTransport extends Transport {
    name: string;
    options: MySQLOptionsType;
    pool: mysql.Pool;


    /**
     * constructor()
     * 
     * MySQLTransport class constructor
     * @param opts MySQL options passed to the connection
     */
    constructor(opts: MySQLOptionsType = {}) {
        super(opts);

        this.name = 'MySQL';

        // Please visit https://github.com/felixge/node-mysql#connection-options to get default options for mysql module
        this.options = opts || {};

        if(!opts.host){
            throw new Error('The database host is required');
        }
        if(!opts.port){
            throw new Error('The database port is required');
        }
        if(!opts.user){
            throw new Error('The database username is required');
        }
        if(!opts.password){
            throw new Error('The database password is required');
        }
        if(!opts.database){
            throw new Error('The database name is required');
        }
        if(!opts.table){
            throw new Error('The database table is required');
        }

        // mysql connection options
        const connOpts = {
            host: opts.host,
            port: opts.port,
            user: opts.user,
            password: opts.password,
            database: opts.database
        }

        this.pool = mysql.createPool(connOpts);
    }

    /**
     * log()
     * 
     * Logging method used in winston transports
     * 
     * @param info 
     * @param callback 
     */
    log = (info: any, callback: any) => {
        const { level, message, module, timestamp, ...winstonMeta } = info;

        process.nextTick(() => {
            // protect the callback function
            callback = callback || (() => {});

            // Ensure the callback is called only once, so call it via this wrapper
            let callbackCalled = false;
            const safeCallback = (err: any, result: any) => {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(err, result);
                }
            };


            this.pool.getConnection((connErr: NodeJS.ErrnoException | null, connection: PoolConnection) => {
                if (connErr) {
                    return safeCallback(connErr, null);
                }

                // If the message is an object, convert it to a stringified JSON
                let msg = message;
                if(typeof msg === 'object' ) {
                    msg = JSON.stringify(msg);
                }

                //Elements to log
                const log = {
                    level: level,
                    message: msg,
                    module: module,
                    timestamp: timestamp.replace("T", " ").replace("Z", "")  // Modify the timestamp format to be included in the DB
                };

                /**
                 * processQuery()
                 * 
                 * Function used as a callback to the query() function that processes the results of the query
                 * 
                 * @param queryErr 
                 * @param results 
                 * @returns 
                 */
                const processQuery = (queryErr:any, results: ResultSetHeader) => {
                    connection.release();

                    // If there was any type of error, emit the 'error' event
                    if(queryErr) {
                        setImmediate(() => {
                            this.emit('error', queryErr);
                        });

                        return safeCallback(queryErr, null);

                    // Everything went well, so emit the 'logged' event in order for winston to continue
                    } else {
                        setImmediate(() => {
                            this.emit('logged', info);
                        });

                        safeCallback(null, true);
                    }
                }

                connection.query(`INSERT INTO ${this.options.table} SET ?`, log, processQuery);
            });
        })
    }
}

export default MySQLTransport;