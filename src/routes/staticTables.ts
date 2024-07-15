/**
 * staticTables.ts
 * 
 * Implementation of the /static route for static table endpoints.
 * 
 */
import { Router } from "express";
import StaticController from '../controllers/staticTables.ts';
import { type PiggybankModel } from '../models/ModelDefinitions.ts';


export default function buildStaticTablesRoutes(pbm: PiggybankModel) {
    const routes: Router = Router();
    const staticController = new StaticController(pbm)
    
    routes.get("/movtypes", staticController.getMovTypes);
    routes.get("/bankperiodicities", staticController.getBankPeriodicities);
    routes.get("/assettypes", staticController.getAssetTypes);
    
    return routes;
}