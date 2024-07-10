import express, {type Express, type Request, type Response } from 'express';
import {cfg} from './cfg.ts';

// Create Express instance
const app: Express = express();

// Disable framework broadcasting
app.disable('x-powered-by');

// Process all the requests as json
app.use(express.json());

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
    console.log(`Server is up and running on port ${cfg.server_port}`);
});


