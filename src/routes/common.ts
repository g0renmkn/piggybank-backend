/**
 * common.ts
 * 
 * Implementation of the /common route for common data endpoints.
 * 
 */
import { Router } from "express";
import CommonDataController from '../controllers/common.ts';
import { type PiggybankModel } from '../models/ModelDefinitions.ts';


export default function buildCommonRoutes(pbm: PiggybankModel) {
    const routes: Router = Router();
    const staticController = new CommonDataController(pbm)
    
    routes.get("/movtypes", staticController.getMovTypes);
    routes.get("/assettypes", staticController.getAssetTypes);
    
    return routes;
}