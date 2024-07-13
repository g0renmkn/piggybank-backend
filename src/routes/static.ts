/**
 * static.ts
 * 
 * Implementation of the /static route for static table endpoints.
 * 
 */
import { Router, type Request, type Response } from "express";
import StaticController from '../controllers/static.ts';

const routes: Router = Router();

routes.get("/movtypes", StaticController.getMovTypes);
routes.get("/bankperiodicities", StaticController.getBankPeriodicities);
routes.get("/assettypes", StaticController.getAssetTypes);

export default routes;