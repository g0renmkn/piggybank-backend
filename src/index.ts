import express, {type Express, type Request, type Response } from 'express';
import {Logger as logger} from './logger/logger.ts';
import {cfg} from './cfg.ts';
import infoRoute from './routes/info.ts';
import staticRoutes from './routes/staticTables.ts';

// Create Express instance
const app: Express = express();

app.disable('x-powered-by');    // Disable framework broadcasting
app.use(express.json());        // Process all the requests as json

// Include routes
app.use('', infoRoute);             // /info endpoint route
app.use('/static', staticRoutes);   // /static routes

// Process any other endpoints that were not considered
app.use((req: Request, res: Response) => {
    res.status(404).json({message: 'Cannot find requested endpoint'});
})

// Start listening
app.listen(cfg.server_port, () => {
    //console.log(`Server is up and running on port ${cfg.server_port}`);
    logger.info('APP', `Server is up and running on port ${cfg.server_port}`)
});
