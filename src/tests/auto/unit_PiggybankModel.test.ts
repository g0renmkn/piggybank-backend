import { describe, expect, it } from "bun:test";
import type { PiggybankModel } from "../../models/ModelDefinitions.ts";
import { PiggybankModelVar } from '../../models/PiggybankModelVar.ts';
import { PiggybankModelMysql } from "../../models/PiggybankModelMysql.ts";
import { 
    generateValidBankAccounts,
    generateValidBankCategories,
    generateValidBankMovements,
    generateValidDataSet
} from "./utils.ts";
import { 
    PBDuplicateRecord, 
    PBNotFoundError,
    PBInvalidAccount,
    PBInvalidCategory,
    PBInvalidPeriodicity
} from "../../models/PiggybankModelErrors.ts";
import { cfg } from "../../cfg.ts";
import { faker } from "@faker-js/faker";


const mysqlConnection = {
    host: cfg.dbHost,
    port: cfg.dbPort,
    user: cfg.dbUser,
    password: cfg.dbPass,
    database: cfg.dbName
}

/**
 * setupBankMovementsTest()
 * 
 * Setup the test environment for bank movements tests
 *
 * @param model 
 */
const setupBankMovementsTest = async (model: PiggybankModel) => {
    await model.clearAllData();

    // Create a set of accounts and categories
    const dataSet = generateValidDataSet({accounts: 3, categories: 5});
    const createdAccounts = await model.createBankAccount(dataSet.accounts);
    const createdCategories = await model.createBankCategory(dataSet.categories);
    const availablePeriodicities = await model.getBankPeriodicities();

    return {
        accArray: createdAccounts.map(a => a.id),
        catArray: createdCategories.map(c => c.id),
        periods: availablePeriodicities.length
    }
}


/**
 * Main test suite
 */
describe.each([  // run tests for each model implementation
//    ['PiggybankModelVar', PiggybankModelVar, {}],
    ['PiggybankModelMysql', PiggybankModelMysql, mysqlConnection],
])('%s', (name, modelImplementation, modelOpts) => {
    // TEST SUITE - create new bank accounts
    describe('createBankAccount()', () => {

        // TEST - failure due to duplicated record
        it('Should fail when adding an already existing record', async () => {
            let errorRaised = false;

            const wrappedFunction = async () =>  {
                const accountRecord = generateValidBankAccounts(1);
                const model = new modelImplementation(modelOpts);
                
                await model.initModel();
    
                await model.createBankAccount(accountRecord);
                await model.createBankAccount(accountRecord);
            }

            try {
                await wrappedFunction();
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBDuplicateRecord);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - failure due to duplicated record in the same attempt
        it('Should fail when adding a duplicated record in the same attempt', async () => {
            let errorRaised = false;

            const wrappedFunction = async () =>  {
                const accountRecord = generateValidBankAccounts(1)[0];
                const model = new modelImplementation(modelOpts);
                await model.initModel();
    
                await model.createBankAccount([accountRecord, accountRecord]);
            }

            try {
                await wrappedFunction();
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBDuplicateRecord);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - successful creation of accounts
        it('Should successfully add the generated accounts', async () => {
            const rndNumber = Math.floor(10*Math.random() + 1);
            const newRecords = generateValidBankAccounts(rndNumber);

            const model = new modelImplementation(modelOpts);            
            await model.initModel();

            const createdRecords = await model.createBankAccount(newRecords);

            expect(createdRecords.length).toBe(rndNumber);
            // Check for each added record, that it was properly created
            newRecords.forEach((rec) => {
                expect(createdRecords).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            name: rec.name,
                            iban: rec.iban,
                            closed: rec.closed,
                            comments: rec.comments
                        })
                    ])
                );
            });
        });
    });

    // TEST SUITE - get bank accounts list
    describe('getBankAccounts()', () => {
        // TEST - get all records (empty data)
        it('Should return an empty array when no records are yet added', async () => {
            const model = new modelImplementation(modelOpts);
            await model.initModel();
            
            await model.deleteAllBankAccounts();
            const ret = await model.getBankAccounts();

            expect(ret).toBeArrayOfSize(0);
        });

        // TEST - get all records (non empty)
        it('Should return an array with the correctly added records', async () => {
            const rndNumber = Math.floor(10*Math.random() + 1);
            const records = generateValidBankAccounts(rndNumber);

            const model = new modelImplementation(modelOpts);
            await model.initModel();

            await model.createBankAccount(records);

            // Check the generated accounts
            const ret = await model.getBankAccounts();
            expect(ret).toBeArrayOfSize(rndNumber);
            
            // Check each record
            records.forEach((rec) => {
                expect(ret).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            name: rec.name,
                            iban: rec.iban,
                            closed: rec.closed,
                            comments: rec.comments
                        })
                    ])
                );
            });
        });
    });

    // TEST SUITE - update bank account
    describe('updateBankAccount()', () => {
        // TEST - failure due to incorrect ID
        it('Should throw an error when trying to update a non existing record', async () => {
            let errorRaised = false;

            const wrappedFunction = async () =>  {
                const accountRecord = generateValidBankAccounts(1);
                const model = new modelImplementation(modelOpts);
                const modification = {
                    name: "random name"
                }

                await model.initModel();
    
                // First create an account
                await model.createBankAccount(accountRecord);

                // Then update an account with wrong ID
                await model.updateBankAccount(345, modification);
            };

            try {
                await wrappedFunction();
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - successful update of a bank account
        it('Should correctly update the selected record', async () => {
            const accountRecord = generateValidBankAccounts(1)[0];
            const model = new modelImplementation(modelOpts);
            const modification = {
                name: "random name"
            };

            await model.initModel();

            // First create an account
            const {id, ...tmp} = (await model.createBankAccount([accountRecord]))[0];

            // Then update an account with wrong ID
            const modifiedRecord = await model.updateBankAccount(id, modification);

            // Check against the modified object
            expect(modifiedRecord).toMatchObject({id, ...accountRecord, ...modification});
        });
    });

    // TEST SUITE - delete bank account
    describe('deleteBankAccount()', () => {
        // TEST - failure due to wrong ID
        it('Should fail due to wrongly provided ID', async () => {
            let errorRaised = false;

            const wrappedFunction = async () =>  {
                const accountRecord = generateValidBankAccounts(1);
                const model = new modelImplementation(modelOpts);

                await model.initModel();
    
                // First create an account
                await model.createBankAccount(accountRecord);

                // Then delete an account with wrong ID
                await model.deleteBankAccount(345);
            };

            try {
                await wrappedFunction();
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        })

        // TEST - successfully delete a bank account
        it('Should succeed correctly deleting the specified account', async () => {
            const accountRecord = generateValidBankAccounts(1)[0];
            const model = new modelImplementation(modelOpts);

            await model.initModel();
            await model.deleteAllBankAccounts();

            // First create an account
            const [{id, ...tmp}] = await model.createBankAccount([accountRecord]);

            // Then delete an account with wrong ID
            const deletedRecord = await model.deleteBankAccount(id);

            expect(deletedRecord).toMatchObject({id, ...accountRecord});
            expect(await model.getBankAccounts()).toBeEmpty();
        })
    });

    // TEST SUITE - delete all bank accounts
    describe('deleteAllBankAccounts()', () => {
        // TEST - delete all accounts
        it('Should successfully delete all accounts', async () => {
            const records = generateValidBankAccounts(3);

            const model = new modelImplementation(modelOpts);
            await model.initModel();

            await model.createBankAccount(records);
            expect(await model.getBankAccounts()).not.toBeEmpty();

            await model.deleteAllBankAccounts();
            expect(await model.getBankAccounts()).toBeEmpty();
        });
    });

    // TEST SUITE - create bank category
    describe('createBankCategory()', () => {
        // TEST - failure due to duplicated record
        it('Should fail when adding an already existing record', async () => {
            let errorRaised = false;

            const wrappedFunction = async () =>  {
                const categoryRecord = generateValidBankCategories(1);
                const model = new modelImplementation(modelOpts);
                
                await model.initModel();
    
                await model.createBankCategory(categoryRecord);
                await model.createBankCategory(categoryRecord);
            }

            try {
                await wrappedFunction();
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBDuplicateRecord);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - failure due to duplicated record in the same attempt
        it('Should fail when adding a duplicated record in the same attempt', async () => {
            let errorRaised = false;

            const wrappedFunction = async () =>  {
                const categoryRecord = generateValidBankCategories(1)[0];
                const model = new modelImplementation(modelOpts);
                await model.initModel();
    
                await model.createBankCategory([categoryRecord, categoryRecord]);
            }

            try {
                await wrappedFunction();
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBDuplicateRecord);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - successful creation of categories
        it('Should successfully add the generated categories', async () => {
            const rndNumber = Math.floor(10*Math.random() + 1);
            const newRecords = generateValidBankCategories(rndNumber);

            const model = new modelImplementation(modelOpts);
            await model.initModel();

            const createdRecords = await model.createBankCategory(newRecords);

            expect(createdRecords.length).toBe(rndNumber);
            // Check for each added record, that it was properly created
            newRecords.forEach((rec) => {
                expect(createdRecords).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            name: rec.name,
                            description: rec.description,
                            icon: rec.icon
                        })
                    ])
                );
            });
        }); 
    });

    // TEST SUITE - get bank categories list
    describe('getBankCategories()', () => {
        // TEST - get all records (empty data)
        it('Should return an empty array when no records are yet added', async () => {
            const model = new modelImplementation(modelOpts);
            await model.initModel();
            
            await model.deleteAllBankCategories();
            const ret = await model.getBankCategories();

            expect(ret).toBeArrayOfSize(0);
        });
        
        // TEST - get all records (non empty)
        it('Should return an array with the correctly added records', async () => {
            const rndNumber = Math.floor(10*Math.random() + 1);
            const records = generateValidBankCategories(rndNumber);

            const model = new modelImplementation(modelOpts);
            await model.initModel();

            await model.createBankCategory(records);

            // Check the generated categories
            const ret = await model.getBankCategories();
            expect(ret).toBeArrayOfSize(rndNumber);
            
            // Check each record
            records.forEach((rec) => {
                expect(ret).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            name: rec.name,
                            description: rec.description,
                            icon: rec.icon
                        })
                    ])
                );
            });
        });
    });

    // TEST SUITE - update bank category
    describe('updateBankCategory()', () => {
        // TEST - failure due to incorrect ID
        it('Should throw an error when trying to update a non existing record', async () => {
            let errorRaised = false;

            const wrappedFunction = async () =>  {
                const categoryRecord = generateValidBankCategories(1);
                const model = new modelImplementation(modelOpts);
                const modification = {
                    name: "random name"
                }

                await model.initModel();
    
                // First create an category
                await model.createBankCategory(categoryRecord);

                // Then update an category with wrong ID
                await model.updateBankCategory(345, modification);
            };

            try {
                await wrappedFunction();
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });
        
        // TEST - successful update of a bank category
        it('Should correctly update the selected record', async () => {
            const categoryRecord = generateValidBankCategories(1)[0];
            const model = new modelImplementation(modelOpts);
            const modification = {
                name: "random name"
            };

            await model.initModel();

            // First create an category
            const {id, ...tmp} = (await model.createBankCategory([categoryRecord]))[0];

            // Then update an category with wrong ID
            const modifiedRecord = await model.updateBankCategory(id, modification);

            // Check against the modified object
            expect(modifiedRecord).toMatchObject({id, ...categoryRecord, ...modification});
        });
    });

    // TEST SUITE - delete bank category
    describe('deleteBankCategory()', () => {
        // TEST - failure due to wrong ID
        it('Should fail due to wrongly provided ID', async () => {
            let errorRaised = false;

            const wrappedFunction = async () =>  {
                const categoryRecord = generateValidBankCategories(1);
                const model = new modelImplementation(modelOpts);

                await model.initModel();
    
                // First create an category
                await model.createBankCategory(categoryRecord);

                // Then delete an category with wrong ID
                await model.deleteBankCategory(345);
            };

            try {
                await wrappedFunction();
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        })

        // TEST - successfully delete a bank category
        it('Should succeed correctly deleting the specified category', async () => {
            const categoryRecord = generateValidBankCategories(1)[0];
            const model = new modelImplementation(modelOpts);

            await model.initModel();
            await model.deleteAllBankCategories();

            // First create an category
            const [{id, ...tmp}] = await model.createBankCategory([categoryRecord]);

            // Then delete an category with wrong ID
            const deletedRecord = await model.deleteBankCategory(id);

            expect(deletedRecord).toMatchObject({id, ...categoryRecord});
            expect(await model.getBankCategories()).toBeEmpty();
        })
    });

    // TEST SUITE - delete all bank categories
    describe('deleteAllBankCategories()', () => {
        // TEST - delete all categories
        it('Should successfully delete all categories', async () => {
            const records = generateValidBankCategories(3);
            const model = new modelImplementation(modelOpts);

            await model.initModel();

            await model.createBankCategory(records);
            expect(await model.getBankCategories()).not.toBeEmpty();

            await model.deleteAllBankCategories();
            expect(await model.getBankCategories()).toBeEmpty();
        });
    });

    // TEST SUITE - create bank movements
    describe("createBankMovements()", () => {
        it("Should fail when provided a wrong account ID", async () => {
            let errorRaised = false;

            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            try {
                const movs = generateValidBankMovements(1, accArray, catArray, periods);
                movs[0].acc_id += 1000;  // specify an invalid account ID
                await model.createBankMovements(movs);
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBInvalidAccount);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        it("Should fail when provided a wrong category ID", async () => {
            let errorRaised = false;

            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            try {
                const movs = generateValidBankMovements(1, accArray, catArray, periods);
                movs[0].category += 1000;  // specify an invalid category ID
                await model.createBankMovements(movs);
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBInvalidCategory);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        it("Should fail when provided a wrong periodicity ID", async () => {
            let errorRaised = false;

            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            try {
                const movs = generateValidBankMovements(1, accArray, catArray, periods);
                movs[0].periodicity += 1000;  // specify an invalid periodicity ID
                await model.createBankMovements(movs);
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBInvalidPeriodicity);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        it('Should successfully create the generated movements', async () => {
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            const movs = generateValidBankMovements(5, accArray, catArray, periods);
            await model.createBankMovements(movs);
            
            // Check the generated movements
            const ret = await model.getBankMovements();
            expect(ret).toBeArrayOfSize(movs.length);

            // Check each record
            movs.forEach((rec) => {
                expect(ret).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            acc_id: rec.acc_id,
                            date: rec.date,
                            category: rec.category,
                            description: rec.description,
                            value: rec.value,
                            periodicity: rec.periodicity,
                            notes: rec.notes
                        })
                    ])
                );
            });
        });
    });

    // TEST SUITE - get bank movements list
    describe('getBankMovements()', () => {
        // TEST - get all records (empty data)
        it('Should return an empty list if no bank movements are found', async () => {
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            await model.clearAllData();

            const ret = await model.getBankMovements();
            expect(ret).toBeArrayOfSize(0);
        });

        // TEST - get all records (non empty)
        it('Should return an array with the correctly added records', async () => {
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            const movs = generateValidBankMovements(5, accArray, catArray, periods);
            await model.createBankMovements(movs);

            const ret = await model.getBankMovements();
            expect(ret).toBeArrayOfSize(movs.length);

            // Check each record
            movs.forEach((rec) => {
                expect(ret).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            acc_id: rec.acc_id,
                            date: rec.date,
                            category: rec.category,
                            description: rec.description,
                            value: rec.value,
                            periodicity: rec.periodicity,
                            notes: rec.notes
                        })
                    ])
                );
            });
        });
    });

    // TEST SUITE - update bank movement
    describe('updateBankMovement()', () => {
        // TEST - failure due to incorrect ID
        it('Should throw an error when trying to update a non existing record', async () => {
            let errorRaised = false;
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            try {
                const movRecord = generateValidBankMovements(1, accArray, catArray, periods);
                await model.createBankMovements(movRecord);

                const modification = {
                    description: "Random string"
                }

                // Then update an movement with wrong ID
                await model.updateBankMovement(345, modification);
            
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - failure due to invalid account ID
        it('Should throw an error if the account ID is not valid', async () => {
            let errorRaised = false;
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            try {
                const movRecord = generateValidBankMovements(1, accArray, catArray, periods);
                const createdRecord = await model.createBankMovements(movRecord);

                const modification = {
                    acc_id: Math.max(...accArray) + 1,  // Ensure the ID is not valid
                };

                await model.updateBankMovement(createdRecord[0].id, modification);
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - failure due to invalid category ID
        it('Should throw an error if the category ID is not valid', async () => {
            let errorRaised = false;
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            try {
                const movRecord = generateValidBankMovements(1, accArray, catArray, periods);
                const createdRecord = await model.createBankMovements(movRecord);

                const modification = {
                    category: Math.max(...catArray) + 1,  // Ensure the ID is not valid
                };

                await model.updateBankMovement(createdRecord[0].id, modification);
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - failure due to invalid periodicity
        it('Should throw an error if the periodicity is not valid', async () => {
            let errorRaised = false;
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(model);

            try {
                const movRecord = generateValidBankMovements(1, accArray, catArray, periods);
                const createdRecord = await model.createBankMovements(movRecord);

                const modification = {
                    periodicity: periods + 1,  // Ensure the ID is not valid
                };

                await model.updateBankMovement(createdRecord[0].id, modification);
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - successfull update
        it('Should update a bank movement', async () => {
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(                model);

            const movRecord = generateValidBankMovements(1, accArray, catArray, periods);
            const createdRecord = await model.createBankMovements(movRecord);

            const modification = {
                description: 'updated description',
            };

            const updatedRecord = await model.updateBankMovement(createdRecord[0].id, modification);

            expect(updatedRecord).toEqual({...createdRecord[0], ...modification});
        });
    });

    // TEST SUITE - delete bank movement
    describe('deleteBankMovement()', () => {
        // TEST - failure due to wrong ID
        it('Should fail due to wrongly provided ID', async () => {
            let errorRaised = false;
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(                model);

            try {
                const movRecord = generateValidBankMovements(1, accArray, catArray, periods);
                await model.createBankMovements(movRecord);

                // Then update an movement with wrong ID
                await model.deleteBankMovement(345);
            
            }
            catch(err: any) {
                expect(err).toBeInstanceOf(PBNotFoundError);
                errorRaised = true;
            }

            expect(errorRaised).toBe(true);
        });

        // TEST - successfully delete a bank movement
        it('Should succeed correctly deleting the specified movement', async () => {
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(                model);

            const movRecord = generateValidBankMovements(1, accArray, catArray, periods);
            const createdRecord = await model.createBankMovements(movRecord);

            const deletedRecord = await model.deleteBankMovement(createdRecord[0].id);

            expect(deletedRecord).toMatchObject({id: createdRecord[0].id, ...movRecord[0]});
            expect(await model.getBankMovements()).toBeEmpty();
        })
    });

    // TEST SUITE - delete all bank movements
    describe('deleteAllBankMovements()', () => {
        // TEST - delete all movements
        it('Should successfully delete all movements', async () => {
            const model = new modelImplementation(modelOpts);
            await model.initModel();

            // Generate basic data for the test
            const {accArray, catArray, periods} = await setupBankMovementsTest(                model);

            const movs = generateValidBankMovements(3, accArray, catArray, periods);
            await model.createBankMovements(movs);
            expect(await model.getBankMovements()).not.toBeEmpty();

            await model.deleteAllBankMovements();
            expect(await model.getBankMovements()).toBeEmpty();
        });
    });
});