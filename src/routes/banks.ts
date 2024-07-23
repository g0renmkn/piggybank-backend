/**
 * banks.ts
 * 
 * Implementation of the /banks routes for Banks management endpoints.
 * 
 */
import { Router, type Request, type Response } from "express";
import BanksController from '../controllers/banks.ts';
import { type PiggybankModel } from '../models/ModelDefinitions.ts';


export default function buildBanksRoutes(pbm: PiggybankModel) {
    const routes: Router = Router();
    const banksController = new BanksController(pbm)
    
    routes.get("/accounts", banksController.getBankAccounts);
    routes.post("/accounts", banksController.postBankAccounts);
    routes.patch("/accounts/:id", banksController.patchBankAccount);
    routes.delete("/accounts/:id", banksController.deleteBankAccount);
    
    return routes;
}