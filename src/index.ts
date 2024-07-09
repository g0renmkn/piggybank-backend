import express, {type Express, type Request, type Response } from 'express';

// Create Express instance
const app: Express = express();

// Disable framework broadcasting
app.disable('x-powered-by');

// Mock serving the main page
app.get('/', (req, res) => {
    res.send('This is the main endpoint response');
})

// Process any other endpoints that were not considered
app.use((req: Request, res: Response) => {
    res.status(404).send('This endpoint is not found');
})

// Start listening
app.listen(3000, () => {
    console.log(`Server is up and running on port 3000`);
});


