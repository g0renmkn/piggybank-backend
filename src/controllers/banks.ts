/**
 * banks.ts
 * 
 * File that implementes the controller functions for the bank management endpoints
 * 
 */
import {type Request, type Response} from 'express';
import { 
    type PiggybankModel, 
    bankAccountSchema,
    bankAccountArraySchema
} from '../models/ModelDefinitions.ts';
import { PBNotFoundError } from '../models/PiggybankModelErrors.ts';


/**
 * Banks endpoints controller class
 */
export default class BanksController {
    piggybankModel: PiggybankModel;

    /**
     * Class constructor
     * 
     * @param pbm Data model to use
     */
    constructor(pbm: PiggybankModel) {
        this.piggybankModel = pbm;
    }


    /**
     * getBankAccounts()
     * 
     * Handle the /banks/accounts GET endpoint
     * 
     * @param req HTTP request object
     * @param res HTTP response object
     */
    getBankAccounts = (req: Request, res: Response): void => {
        res.status(200).json(this.piggybankModel.getBankAccounts());
    }


    /**
     * postBankAccounts()
     * 
     * Handle the /banks/accounts POST endpoint
     * 
     * @param req HTTP request object
     * @param res HTTP response object
     */
    postBankAccounts = (req: Request, res: Response): void => {
        const validatedSchema = bankAccountArraySchema.safeParse(req.body);
        if(validatedSchema.error) {
            res.status(400).json(validatedSchema.error);
        }
        else {
            res.status(200).json(this.piggybankModel.createBankAccount(validatedSchema.data));
        }
    }


    /**
     * patchBankAccount()
     * 
     * Handle the /banks/account/:id PATCH endpoint
     * 
     * @param req HTTP request object
     * @param res HTTP response object
     */
    patchBankAccount = (req: Request, res: Response): void => {
        // Get ID from the query params
        const {id} = req.params;

        // Validate the input partially (just for the provided fields)
        const validatedSchema = bankAccountSchema.partial().safeParse(req.body);
        if(validatedSchema.error) {
            res.status(400).json(validatedSchema.error);
        }
        else {
            try {
                const updatedItem = this.piggybankModel.updateBankAccount(Number(id), validatedSchema.data)
                res.status(200).json(updatedItem)
            }
            catch(err:any) {
                if(err instanceof PBNotFoundError)
                {
                    res.status(404).json(err);
                }
                else {
                    res.status(400).json(err);
                }
            }
        }

    }


    /**
     * deleteBankAccount()
     * 
     * Handle the /banks/account/:id DELETE endpoint
     * 
     * @param req HTTP request object
     * @param res HTTP response object
     */
    deleteBankAccount = (req: Request, res: Response): void => {
        const {id} = req.params;

        try {
            const itemDeleted = this.piggybankModel.deleteBankAccount(Number(id));
            if(itemDeleted) {
                res.status(200).json(itemDeleted)
            }
        }
        catch(err:any) {
            if(err instanceof PBNotFoundError)
            {
                res.status(404).json(err);
            }
            else {
                res.status(400).json(err);
            }
        }
    }

}