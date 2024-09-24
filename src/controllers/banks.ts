/**
 * banks.ts
 * 
 * File that implementes the controller functions for the bank management endpoints
 * 
 */
import {
    type Request, 
    type Response
} from 'express';

import { 
    type PiggybankModel, 
    bankAccountSchema,
    bankAccountArraySchema,
    type BankAccountTypeExt
} from '../models/ModelDefinitions.ts';

import {
    PBDuplicateRecord,
    PBNotFoundError
} from '../models/PiggybankModelErrors.ts';

import ErrorResponses from './ErrorResponses.ts';
import parentLogger from '../logger/logger.ts';

const logger = parentLogger.child({module: "BANK CONTROLLER"});

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
    getBankAccounts = async (req: Request, res: Response): Promise<void> => {
        res.status(200).json(await this.piggybankModel.getBankAccounts());
    }


    /**
     * postBankAccounts()
     * 
     * Handle the /banks/accounts POST endpoint
     * 
     * @param req HTTP request object
     * @param res HTTP response object
     */
    postBankAccounts = async (req: Request, res: Response): Promise<void> => {
        let body;

        // Check to allow single object as input (not an array)
        if(req.body instanceof Array) {
            body = req.body;
        }
        else {
            body = [req.body];
        }

        const validatedSchema = bankAccountArraySchema.safeParse(body);
        
        if(validatedSchema.error) {
            const ret = ErrorResponses.ErrValidationError(validatedSchema.error);
            res.status(400).json(ret);
        }
        else {
            try {
                let ret: BankAccountTypeExt[];
                ret = await this.piggybankModel.createBankAccount(validatedSchema.data);
                res.status(200).json(ret);
            }
            catch(err: any) {
                if(err instanceof PBDuplicateRecord) {
                    res.status(403).json(ErrorResponses.ErrDuplicatedRecord());
                }
                else {
                    res.status(500).json(ErrorResponses.ErrUnexpected());
                    logger.error(err);
                }
            }
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
    patchBankAccount = async (req: Request, res: Response): Promise<void> => {
        // Get ID from the query params
        const {id} = req.params;

        // Validate the input partially (just for the provided fields)
        const validatedSchema = bankAccountSchema.partial().safeParse(req.body);
        if(validatedSchema.error) {
            const ret = ErrorResponses.ErrValidationError(validatedSchema.error);
            res.status(400).json(ret);
        }
        else {
            try {
                const updatedItem = await this.piggybankModel.updateBankAccount(Number(id), validatedSchema.data)
                res.status(200).json(updatedItem)
            }
            catch(err:any) {
                if(err instanceof PBNotFoundError) {
                    res.status(404).json(ErrorResponses.ErrRecordNotFound(Number(id)));
                }
                else {
                    res.status(500).json(ErrorResponses.ErrUnexpected());
                    logger.error(err);
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
    deleteBankAccount = async (req: Request, res: Response): Promise<void> => {
        const {id} = req.params;

        try {
            const itemDeleted = await this.piggybankModel.deleteBankAccount(Number(id));
            if(itemDeleted) {
                res.status(200).json(itemDeleted)
            }
        }
        catch(err:any) {
            if(err instanceof PBNotFoundError) {
                res.status(404).json(ErrorResponses.ErrRecordNotFound(Number(id)));
            }
            else {
                res.status(500).json(ErrorResponses.ErrUnexpected());
                logger.error(err);
            }
        }
    }
}