/**
 * common.ts
 * 
 * File that implementes the controller functions for the common data
 * 
 */
import {type Request, type Response} from 'express';
import { type PiggybankModel } from '../models/ModelDefinitions.ts';


export default class CommonDataController {
    piggybankModel: PiggybankModel;

    constructor(pbm: PiggybankModel) {
        this.piggybankModel = pbm;
    }

    // Process the request to get the table of movement types
    getMovTypes = async (req: Request, res: Response): Promise<void> => {
        res.status(200).json(await this.piggybankModel.getCommonMovTypes());
    }
    
    // Process the request to get the table of asset types
    getAssetTypes = async (req: Request, res: Response): Promise<void> => {
        res.status(200).json(await this.piggybankModel.getCommonAssetTypes());
    }
}
