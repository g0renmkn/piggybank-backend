/**
 * info.ts
 * 
 * Implementation of the /info endpoint route. No controller needed since this is a very basic endpoint.
 * 
 */
import { Router, type Request, type Response } from "express";

const routes: Router = Router();

routes.get("/info", (req: Request, res: Response) => {
    res.status(200).json({serverVersion: "0.1.0", apiVersion: "0.0.1"});
});

export default routes;