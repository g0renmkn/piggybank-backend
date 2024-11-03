/**
 * PiggybankModelErrors.ts
 * 
 * File where all the specific errors related to the Piggybank Model are defined.
 */


// Error that occurs when a specified record is not found
export class PBNotFoundError extends Error {}

// Error that occurs when trying to add a record that already exists
export class PBDuplicateRecord extends Error {}

// Error that occurs when trying to add a record specifying an invalid account
export class PBInvalidAccount extends Error {}

// Error that occurs when trying to add a record specifying an invalid category
export class PBInvalidCategory extends Error {}

// Error that occurs when trying to add a record specifying an invalid periodicity
export class PBInvalidPeriodicity extends Error {}