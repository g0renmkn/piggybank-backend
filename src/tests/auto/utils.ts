import { faker } from "@faker-js/faker";

/**
 * generateValidBankAccounts()
 * 
 * Generate an array of valid bank account objects
 *
 * @param num Number of accounts to generate
 * @returns 
 */
export function generateValidBankAccounts(num: number = 1) {
    let ret = [];
    
    for(let i=0; i<num; i++) {
        ret.push({
            name: faker.string.sample({min: 30, max: 30}),
            iban: faker.finance.iban(),
            closed: faker.date.birthdate().toISOString(),
            comments: faker.string.sample({min: 200, max: 200}),
            pfp: faker.string.sample({min: 5, max: 50})
        });
    }

    return ret;
}


/**
 * generateValidBankCategories()
 * 
 * Generate an array of valid bank category objects
 *
 * @param num Number of categories to generate
 * @returns 
 */
export function generateValidBankCategories(num: number = 1) {
    let ret = [];
    
    for(let i=0; i<num; i++) {
        ret.push({
            name: faker.string.sample({min: 30, max: 30}),
            description: faker.string.sample({min: 200, max: 200}),
            icon: faker.string.sample({min: 5, max: 100}),
        });
    }
    
    return ret;
}
