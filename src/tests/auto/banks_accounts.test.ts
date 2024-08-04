import { describe, expect, it, beforeEach } from "bun:test";
import request from 'supertest';
import PiggyApp from '../../app.ts';
import { PiggybankModelVar } from '../../models/PiggybankModelVar.ts';
import { faker } from "@faker-js/faker";


describe('Bank accounts', () => {
    // TEST SUITE - GET empty bank account data
    describe('GET /banks/accounts - empty data', () => {
        // TEST - get all records (empty)
        it('Should return an empty array when no records are yet added', async () => {
            const piggyApp = new PiggyApp(new PiggybankModelVar());
            const res = await request(piggyApp.app).get("/banks/accounts");
            expect(res.status).toBe(200);
            expect(res.body).toBeArrayOfSize(0);
        });
    })

    // TEST SUITE - GET non empty bank account data
    describe('GET /banks/accounts - non empty data', () => {
        // TEST - get all records (non empty)
        it('Should return an array with the correctly added records', async () => {
            const piggyApp = new PiggyApp(new PiggybankModelVar());
            const numElements = Math.floor(Math.random()*10 + 1);
            const dataArr = [];

            // Generate the accounts
            for(let i=0; i<numElements; i++) {
                dataArr.push({
                    name: faker.string.sample({min: 19, max: 19}),
                    iban: faker.finance.iban(),
                    closed: "",
                    comments: faker.string.sample({min: 199, max: 199})
                })
            }
            // Create accounts in the model
            piggyApp.model.createBankAccount(dataArr);
            
            const res = await request(piggyApp.app).get("/banks/accounts");
            expect(res.status).toBe(200);
            expect(res.body).toBeArrayOfSize(numElements);
        });
    });

    // TEST SUITE - Post record with wrong data
    describe('POST /banks/accounts - wrong data input', () => {
        let piggyApp: PiggyApp;

        // PREPARE TESTS
        beforeEach(() => {
            piggyApp = new PiggyApp(new PiggybankModelVar());
        });

        // TEST - missing account name
        it('Should fail due to name missing', async () => {
            const accountRecord = {
                iban: faker.finance.iban(),
                closed: faker.date.birthdate().toISOString(),
                comments: faker.string.sample({min: 199, max: 199})
            }

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("details");
            expect(res.body.details).toBe("Required");
        });

        // TEST - account name too long
        it('Should fail due to name too long', async () => {
            const accountRecord = {
                name: faker.string.sample({min: 21, max: 21}),
                iban: faker.finance.iban(),
                closed: faker.date.birthdate().toISOString(),
                comments: faker.string.sample({min: 199, max: 199})
            }

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - account iban missing
        it('Should fail due to iban missing', async () => {
            const accountRecord = {
                name: faker.string.sample({min: 19, max: 19}),
                closed: faker.date.birthdate().toISOString(),
                comments: faker.string.sample({min: 199, max: 199})
            }

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("details");
            expect(res.body.details).toBe("Required");
        });

        // TEST - account iban too long
        it('Should fail due to iban too long', async () => {
            const accountRecord = {
                name: faker.string.sample({min: 19, max: 19}),
                iban: faker.string.sample({min: 25, max: 25}),
                closed: faker.date.birthdate().toISOString(),
                comments: faker.string.sample({min: 199, max: 199})
            }

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - wrong date
        it('Should fail due to date in wrong format', async () => {
            const accountRecord = {
                name: faker.string.sample({min: 19, max: 19}),
                iban: faker.finance.iban(),
                closed: "wront date",
                comments: faker.string.sample({min: 199, max: 199})
            }

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - wrong comments
        it('Should fail due to wrong comments format', async () => {
            const accountRecord = {
                name: faker.string.sample({min: 19, max: 19}),
                iban: faker.finance.iban(),
                closed: faker.date.birthdate().toISOString(),
                comments: 25
            }

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - duplicated entry
        it('Should fail due to duplicated entry', async () => {
            const accountRecord = {
                name: faker.string.sample({min: 19, max: 19}),
                iban: faker.finance.iban(),
                closed: faker.date.birthdate().toISOString(),
                comments: faker.string.sample({min: 199, max: 199})
            }

            // First add the record
            piggyApp.model.createBankAccount([accountRecord]);

            // Next add it via POST again
            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(403);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - successful post
        it('Should success on correct posting', async () => {
            const accountRecord = {
                name: faker.string.sample({min: 19, max: 19}),
                iban: faker.finance.iban(),
                closed: faker.date.birthdate().toISOString(),
                comments: faker.string.sample({min: 199, max: 199})
            }

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(200);
        });
    });
})