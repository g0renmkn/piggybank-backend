/**
 * static.ts
 * 
 * File that implementes the controller functions for the static tables
 * 
 */
import {type Request, type Response} from 'express';
import StaticTables from '../models/staticTables.ts'

// Process the request to get the table of movement types
function _getMovTypes(req: Request, res: Response) {
    res.status(200).json(StaticTables.getMovementTypes());
}

// Process the request to get the table of bank periodicities
function _getBankPeriodicities(req: Request, res: Response) {
    res.status(200).json(StaticTables.getBankPeriodicities());
}

// Process the request to get the table of asset types
function _getAssetTypes(req: Request, res: Response) {
    res.status(200).json(StaticTables.getAssetTypes());
}

// Export the default object
export default {
    getMovTypes: _getMovTypes,
    getBankPeriodicities: _getBankPeriodicities,
    getAssetTypes: _getAssetTypes
}