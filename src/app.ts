import express, {type Express, type NextFunction, type Request, type Response } from 'express';
import parentLogger from './logger/logger.ts';
import {cfg} from './cfg.ts';
import infoRoute from './routes/info.ts';
import buildStaticTablesRoutes from './routes/staticTables.ts';
import buildBanksRoutes from './routes/banks.ts';
import { type PiggybankModel } from './models/ModelDefinitions.ts';

// Get the child logger for this module
const logger = parentLogger.child({module: "APP"})
logger.info('Loaded config: ');
logger.info(cfg);


/**
 * Class PiggybankApp
 */
export default class PiggybankApp {
    app: Express;
    model: PiggybankModel;


    /**
     * Class constructor
     * 
     * @param mdl Piggybank model to use
     */
    constructor(mdl: PiggybankModel) {
        this.model = mdl;
        this.app = express();

        this.app.disable('x-powered-by');    // Disable framework broadcasting
        this.app.use(express.json());        // Process all the requests as json

        // Incoming request middleware, just to log every request (even invalid ones)
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            const retobj = {
                endpoint: req.url,
                client: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                useragent: req.headers['user-agent'],
                body: req.body,
                params: req.params
            }
            logger.info(`REQUEST INCOMING: \n${JSON.stringify(retobj, null, 2)}`);

            return next();
        });

        // Include routes
        this.app.use('', infoRoute);             // /info endpoint route
        this.app.use('/static', buildStaticTablesRoutes(this.model));   // /static routes
        this.app.use('/banks', buildBanksRoutes(this.model));      // /banks routes

        // Process any other endpoints that were not considered
        this.app.use((req: Request, res: Response) => {
            res.status(404).json({message: 'Cannot find requested endpoint'});
        })
    }


    /**
     * listen() 
     * 
     * Get the app listening for connections
     */
    listen = () => {
        this.app.listen(cfg.serverPort, () => {
            logger.info(`Server is up and running on port ${cfg.serverPort}`);
        });
    }


    /**
     * getExpressInstance()
     * 
     * @returns Initialized express instance
     */
    getExpressInstance = () => {
        return this.app;
    }
}
