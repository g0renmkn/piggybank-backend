/**
 * banks.ts
 * 
 * File that implementes the controller functions for the bank management endpoints
 * 
 */
import {type Request, type Response} from 'express';
import { type PiggybankModel } from '../models/ModelDefinitions.ts';

export default class BanksController {
    piggybankModel: PiggybankModel;

    constructor(pbm: PiggybankModel) {
        this.piggybankModel = pbm;
    }

    getBankAccounts = (req: Request, res: Response): void => {
        res.status(200).json(this.piggybankModel.getBankAccounts());
    }


    postBankAccounts = (req: Request, res: Response): void => {
        // ToDo
    }


    patchBankAccount = (req: Request, res: Response): void => {
        // ToDo
    }


    deleteBankAccount = (req: Request, res: Response): void => {
        // ToDo
    }

}