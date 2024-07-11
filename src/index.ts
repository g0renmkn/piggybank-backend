import express, {type Express, type Request, type Response } from 'express';
import {cfg} from './cfg.ts';
import {Logger as logger} from './logger/logger.ts';

// Create Express instance
const app: Express = express();

app.disable('x-powered-by');    // Disable framework broadcasting
app.use(express.json());        // Process all the requests as json

// Mock serving the main page
app.get('/', (req, res) => {
    res.json({message: 'This is the main endpoint response'});
})

// Process any other endpoints that were not considered
app.use((req: Request, res: Response) => {
    res.status(404).json({message: 'This endpoint is not found'});
})

// Start listening
app.listen(cfg.server_port, () => {
    //console.log(`Server is up and running on port ${cfg.server_port}`);
    logger.info('APP', `Server is up and running on port ${cfg.server_port}`)
});
