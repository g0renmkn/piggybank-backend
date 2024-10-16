import { describe, expect, it, beforeEach, beforeAll } from "bun:test";
import request from 'supertest';
import PiggyApp from '../../app.ts';
import { type PiggybankModel } from '../../models/ModelDefinitions.ts';
import { PiggybankModelVar } from '../../models/PiggybankModelVar.ts';
import { PiggybankModelMysql } from "../../models/PiggybankModelMysql.ts";
import { faker } from "@faker-js/faker";
import { generateValidBankCategory } from './utils.ts';
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
    let model: PiggybankModel;

    // Prepare all tests
    beforeAll(async () => {
        model = new modelImplementation(modelOpts);
        await model.initModel();
    });

    // Clear all data before each test
    beforeEach(async () => {
        await model.clearAllData();
    });

    // TEST SUITE - GET empty bank category data
    describe('GET /banks/categories', () => {
        let piggyApp: PiggyApp;

        // Prepare each test
        beforeEach(async () => {
            piggyApp = new PiggyApp(model);
        });

        // TEST - get all records (empty)
        it('Should return an empty array when no records are yet added', async () => {
            await model.deleteAllBankCategories();  // Ensure there are no records
            const res = await request(piggyApp.app).get("/banks/categories");

            expect(res.status, "Request to /banks/categories should return 200").toBe(200);
            expect(res.body, "Returned bank categories should be an empty array").toBeArrayOfSize(0);
        });

        // TEST - get all records (non empty)
        it('Should return an array with the correctly added records', async () => {
            const numElements = Math.floor(Math.random()*10 + 1);
            const dataArr = [];

            model.deleteAllBankCategories();

            // Generate the categories
            for(let i=0; i<numElements; i++) {
                dataArr.push(generateValidBankCategory())
            }
            // Create categories in the model
            await model.createBankCategory(dataArr);
            
            const res = await request(piggyApp.app).get("/banks/categories");
            expect(res.status, "Request to /banks/categories should return 200").toBe(200);
            expect(res.body, "Returned bank categories should be an array of size").toBeArrayOfSize(numElements);
        });
    });

    // TEST SUITE - Post new records
    describe('POST /banks/categories', () => {
        let piggyApp: PiggyApp;

        // PREPARE TESTS
        beforeEach(async () => {
            piggyApp = new PiggyApp(model);
        });

        // TEST - missing category name
        it('Should fail due to name missing', async () => {
            // Generate a valid category without a name
            let {name, ...categoryRecord} = generateValidBankCategory();

            const res = await request(piggyApp.app)
                .post("/banks/categories")
                .send([categoryRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("details");
            expect(res.body.details).toBe("Required");
        });

        // TEST - category name too long
        it('Should fail due to name too long', async () => {
            let categoryRecord = generateValidBankCategory();

            // Modify name to exceed constraints
            categoryRecord.name = faker.string.sample({min: 31, max: 31});

            const res = await request(piggyApp.app)
                .post("/banks/categories")
                .send([categoryRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - category description too long
        it('Should fail due to description too long', async () => {
            let categoryRecord = generateValidBankCategory();

            // Modify description to exceed constraints
            categoryRecord.description = faker.string.sample({min: 201, max: 201});

            const res = await request(piggyApp.app)
                .post("/banks/categories")
                .send([categoryRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - category icon too long
        it('Should fail due to icon too long', async () => {
            let categoryRecord = generateValidBankCategory();

            // Modify icon to exceed constraints
            categoryRecord.icon = faker.string.sample({min: 101, max: 101});

            const res = await request(piggyApp.app)
                .post("/banks/categories")
                .send([categoryRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - duplicated entry
        it('Should fail due to duplicated entry', async () => {
            const categoryRecord = generateValidBankCategory();

            // First add the record
            await model.createBankCategory([categoryRecord]);

            // Next add it via POST again
            const res = await request(piggyApp.app)
                .post("/banks/categories")
                .send([categoryRecord]);

            expect(res.status).toBe(403);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - successful post
        it('Should succeed on correct posting', async () => {
            const categoryRecord = generateValidBankCategory();

            const res = await request(piggyApp.app)
                .post("/banks/categories")
                .send([categoryRecord]);

            expect(res.status).toBe(200);
        });
    });
    
    // TEST SUITE - PATCH records
    describe('PATCH /banks/categories/:id', () => {
        let piggyApp: PiggyApp;
        let catId: number = -1;

        // PREPARE TESTS
        beforeEach(async () => {
            const categoryRecord = generateValidBankCategory();
            
            piggyApp = new PiggyApp(model);

            // Generate a new category record
            const addedCategory = await model.createBankCategory([categoryRecord]);
            catId = addedCategory[0].id;
        });

        // TEST - record not found
        it('Should fail when provided a non existing ID', async () => {
            const modification = {
                name: "test",
            }

            const res = await request(piggyApp.app)
                .post(`/banks/categories/${catId+100}`)
                .send(modification);

            expect(res.status).toBe(404);
        });

        // TEST - name too long
        it('Should fail when name is too long', async () => {
            const modification = {
                name: faker.string.sample({min: 31, max: 31}),
            }

            const res = await request(piggyApp.app)
                .patch(`/banks/categories/${catId}`)
                .send(modification);

            expect(res.status).toBe(400);
        });

        // TEST - description too long
        it('Should fail when description is too long', async () => {
            const modification = {
                description: faker.string.sample({min: 201, max: 201}),
            }

            const res = await request(piggyApp.app)
                .patch(`/banks/categories/${catId}`)
                .send(modification);

            expect(res.status).toBe(400);
        });

        // TEST - icon too long
        it('Should fail when icon is too long', async () => {
            const modification = {
                icon: faker.string.sample({min: 101, max: 101}),
            }

            const res = await request(piggyApp.app)
                .patch(`/banks/categories/${catId}`)
                .send(modification);

            expect(res.status).toBe(400);
        });

        // TEST - successful update
        it('Should succeed when the update is valid', async () => {
            const modification = generateValidBankCategory();

            const res = await request(piggyApp.app)
                .patch(`/banks/categories/${catId}`)
                .send(modification);

            expect(res.status).toBe(200);
        });
    });

    // TEST SUITE - DELETE records
    describe('DELETE /banks/categories/:id', () => {
        let piggyApp: PiggyApp;
        let catId: number = -1;

        // PREPARE TESTS
        beforeEach(async () => {
            const categoryRecord = generateValidBankCategory();
            
            piggyApp = new PiggyApp(model);

            // Generate a new category record
            const addedCategory = await model.createBankCategory([categoryRecord]);
            catId = addedCategory[0].id;
        });

        // TEST - wrong record ID
        it('Should fail when provided a non existing ID', async () => {
            const res = await request(piggyApp.app)
                .delete(`/banks/categories/${catId+100}`)

            expect(res.status).toBe(404);
        });

        // TEST - successful deletion
        it('Should succeed when deleting an existing record', async () => {
            // Get a copy of the bank categories to later check
            const arr = (await model.getBankCategories()).slice(0);
            expect(arr).toBeArrayOfSize(1);

            const res = await request(piggyApp.app)
                .delete(`/banks/categories/${catId}`)

            expect(res.status).toBe(200);
            expect(await model.getBankCategories()).toBeEmpty();

            // Check if the response is correct
            expect(res.body).toMatchObject(arr[0]);
        });
    });
});