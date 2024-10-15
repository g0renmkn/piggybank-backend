import { describe, expect, it } from "bun:test";
import { PiggybankModelVar } from '../../models/PiggybankModelVar.ts';
import { PiggybankModelMysql } from "../../models/PiggybankModelMysql.ts";
import { 
    generateValidBankAccount,
    generateValidBankCategory
} from "./utils.ts";
import { PBDuplicateRecord, PBNotFoundError } from "../../models/PiggybankModelErrors.ts";
import { cfg } from "../../cfg.ts";

const mysqlConnection = {
    host: cfg.dbHost,
    port: cfg.dbPort,
    user: cfg.dbUser,
    password: cfg.dbPass,
    database: cfg.dbName
}

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
                const accountRecord = generateValidBankAccount();
                const model = new modelImplementation(modelOpts);
                
                await model.initModel();
    
                await model.createBankAccount([accountRecord]);
                await model.createBankAccount([accountRecord]);
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
                const accountRecord = generateValidBankAccount();
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
            const newRecords = []
            const model = new modelImplementation(modelOpts);
            
            await model.initModel();

            // Create a bunch of bank accounts
            for(let i=0; i<rndNumber; i++) {
                newRecords.push(generateValidBankAccount());
            }
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
            const records = []
            const model = new modelImplementation(modelOpts);

            await model.initModel();

            // Create a bunch of bank accounts
            for(let i=0; i<rndNumber; i++) {
                records.push(generateValidBankAccount());
            }
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
                const accountRecord = generateValidBankAccount();
                const model = new modelImplementation(modelOpts);
                const modification = {
                    name: "random name"
                }

                await model.initModel();
    
                // First create an account
                await model.createBankAccount([accountRecord]);

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
            const accountRecord = generateValidBankAccount();
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
                const accountRecord = generateValidBankAccount();
                const model = new modelImplementation(modelOpts);

                await model.initModel();
    
                // First create an account
                await model.createBankAccount([accountRecord]);

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
            const accountRecord = generateValidBankAccount();
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
            const records = [
                generateValidBankAccount(),
                generateValidBankAccount(),
                generateValidBankAccount()
            ];
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
                const categoryRecord = generateValidBankCategory();
                const model = new modelImplementation(modelOpts);
                
                await model.initModel();
    
                await model.createBankCategory([categoryRecord]);
                await model.createBankCategory([categoryRecord]);
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
                const categoryRecord = generateValidBankCategory();
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
            const newRecords = []
            const model = new modelImplementation(modelOpts);
            
            await model.initModel();

            // Create a bunch of bank categories
            for(let i=0; i<rndNumber; i++) {
                newRecords.push(generateValidBankCategory());
            }
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
            const records = []
            const model = new modelImplementation(modelOpts);

            await model.initModel();

            // Create a bunch of bank categories
            for(let i=0; i<rndNumber; i++) {
                records.push(generateValidBankCategory());
            }
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
                const categoryRecord = generateValidBankCategory();
                const model = new modelImplementation(modelOpts);
                const modification = {
                    name: "random name"
                }

                await model.initModel();
    
                // First create an category
                await model.createBankCategory([categoryRecord]);

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
            const categoryRecord = generateValidBankCategory();
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
                const categoryRecord = generateValidBankCategory();
                const model = new modelImplementation(modelOpts);

                await model.initModel();
    
                // First create an category
                await model.createBankCategory([categoryRecord]);

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
            const categoryRecord = generateValidBankCategory();
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
            const records = [
                generateValidBankCategory(),
                generateValidBankCategory(),
                generateValidBankCategory()
            ];
            const model = new modelImplementation(modelOpts);

            await model.initModel();

            await model.createBankCategory(records);
            expect(await model.getBankCategories()).not.toBeEmpty();

            await model.deleteAllBankCategories();
            expect(await model.getBankCategories()).toBeEmpty();
        });
    });
});