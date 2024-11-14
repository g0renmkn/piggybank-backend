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


/**
 * generateValidBankMovements()
 * 
 * Generate an array of valid bank movement objects
 *
 * @param num Number of movements to generate
 * @param accs Array of valid account IDs
 * @param cats Array of valid category IDs
 * @returns 
 */
export function generateValidBankMovements(num: number = 1, accs: number[], cats: number[], per: number) {
    let ret = [];
    
    for(let i=0; i<num; i++) {
        ret.push({
            acc_id: accs[Math.floor(Math.random()*accs.length)],
            date: faker.date.birthdate().toISOString(),
            category: cats[Math.floor(Math.random()*cats.length)],
            description: faker.string.sample({min: 50, max: 50}),
            value: Number(faker.finance.amount()),
            periodicity: Math.floor(1+Math.random()*per),
            notes: faker.string.sample({min: 100, max: 100}),
        });
    }
    
    return ret;
}


/**
 * generateDataSet()
 * 
 * Generate a valid data set for testing
 *
 * @param qty 
 * @returns 
 */
export function generateValidDataSet(qty: { accounts?: number, categories?: number } ) {
    const ret: any = {
        accounts: [],
        categories: []
    }

    // Generate accounts
    if(qty.accounts && qty.accounts > 0) {
        ret.accounts = generateValidBankAccounts(Math.floor(Math.random()*qty.accounts + 1));
    }

    // Generate categories
    if(qty.categories && qty.categories > 0) {
        ret.categories = generateValidBankCategories(Math.floor(Math.random()*qty.categories + 1));
    }

    return ret;
}
