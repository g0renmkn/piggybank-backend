/**
 * ErrorResponses.ts
 * 
 * Definition of API error responses
 */

type ErrObject = {
    err: string;
    message: string;
    data?: object[];
}

/**
 * Class ErrorResponses
 */
export default class ErrorResponses {
    /**
     * ErrRecordNotFound()
     * 
     * @param id ID that caused the error
     * @returns Error object
     */
    static ErrRecordNotFound(id: number): ErrObject {
        return {
            err: "ErrRecordNotFound",
            message: `A record with ID=${id} was not found.`
        }
    }


    /**
     * ErrDuplicatedRecord()
     * 
     * @returns Error object
     */
    static ErrDuplicatedRecord(): ErrObject {
        return {
            err: "ErrDuplicatedRecord",
            message: `One of the input records already exists or is being duplicated.`
        }
    }


    /**
     * ErrValidationError()
     * 
     * @param valResult Validation result object
     */
    static ErrValidationError(valResult: object): ErrObject {
        return {
            err: "ErrValidationError",
            message: `There were problems validating data:`,
            data: []
        }
    }


    /**
     * ErrUnexpected()
     * 
     * @returns Error object
     */
    static ErrUnexpected(): ErrObject {
        return {
            err: "ErrUnexpected",
            message: `An unexpected error was found. Check server logs.`
        }
    }
}