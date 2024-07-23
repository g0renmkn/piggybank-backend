/**
 * ErrorResponses.ts
 * 
 * Definition of API error responses
 */

type ErrObject = {
    err: string;
    message: string;
    details?: any;
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
     * Display the first found error while validating an input
     * 
     * @param valResult Validation result object
     */
    static ErrValidationError(valResult: any): ErrObject {
        let ret = {
            err: "ErrValidationError",
            message: 'There were problems validating data',
            details: ""
        }

        if("issues" in valResult) {
            let issue = valResult.issues[0];
            
            if(issue.path.length > 1) {
                ret.message += ` on element ${issue.path[0]}, field '${issue.path[1]}'`
            }
            else {
                ret.message += ` on field '${issue.path[0]}'`
            }
            ret.details = issue.message;
        }

        return ret;
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