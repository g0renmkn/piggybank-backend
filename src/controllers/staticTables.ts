/**
 * staticTables.ts
 * 
 * File that implementes the controller functions for the static tables
 * 
 */
import {type Request, type Response} from 'express';
import { type PiggybankModel } from '../models/ModelDefinitions.ts';


export default class StaticTablesController {
    piggybankModel: PiggybankModel;

    constructor(pbm: PiggybankModel) {
        this.piggybankModel = pbm;
    }

    // Process the request to get the table of movement types
    getMovTypes = (req: Request, res: Response): void => {
        res.status(200).json(this.piggybankModel.getMovementTypes());
    }

    // Process the request to get the table of bank periodicities
    getBankPeriodicities = (req: Request, res: Response): void => {
        res.status(200).json(this.piggybankModel.getBankPeriodicities());
    }
    
    // Process the request to get the table of asset types
    getAssetTypes = (req: Request, res: Response): void => {
        res.status(200).json(this.piggybankModel.getAssetTypes());
    }
}
