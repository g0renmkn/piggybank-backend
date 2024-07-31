import express, {type Express, type Request, type Response } from 'express';
import parentLogger from './logger/logger.ts';
import {cfg} from './cfg.ts';
import infoRoute from './routes/info.ts';
import buildStaticTablesRoutes from './routes/staticTables.ts';
import buildBanksRoutes from './routes/banks.ts';
import { type PiggybankModel } from './models/ModelDefinitions.ts';
import { PiggybankModelVar } from './models/PiggybankModelVar.ts';

// Get the child logger for this module
const logger = parentLogger.child({module: "APP"})
logger.info('Loaded config: ');
logger.info(cfg);

// Define the data model to be used
const piggybankModel: PiggybankModel = new PiggybankModelVar();

// Create Express instance
const app: Express = express();

app.disable('x-powered-by');    // Disable framework broadcasting
app.use(express.json());        // Process all the requests as json

// Include routes
app.use('', infoRoute);             // /info endpoint route
app.use('/static', buildStaticTablesRoutes(piggybankModel));   // /static routes
app.use('/banks', buildBanksRoutes(piggybankModel));      // /banks routes

// Process any other endpoints that were not considered
app.use((req: Request, res: Response) => {
    res.status(404).json({message: 'Cannot find requested endpoint'});
})

// Start listening
app.listen(cfg.server_port, () => {
    logger.info(`Server is up and running on port ${cfg.server_port}`);
});
