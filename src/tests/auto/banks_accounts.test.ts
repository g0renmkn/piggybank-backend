import { describe, expect, it, beforeEach } from "bun:test";
import request from 'supertest';
import PiggyApp from '../../app.ts';
import { PiggybankModelVar } from '../../models/PiggybankModelVar.ts';
import { faker } from "@faker-js/faker";


// Generate a valid account object
function generateValidAccount() {
    return {
        name: faker.string.sample({min: 30, max: 30}),
        iban: faker.finance.iban(),
        closed: faker.date.birthdate().toISOString(),
        comments: faker.string.sample({min: 200, max: 200})
    }
}


describe('Bank accounts', () => {
    // TEST SUITE - GET empty bank account data
    describe('GET /banks/accounts', () => {
        // TEST - get all records (empty)
        it('Should return an empty array when no records are yet added', async () => {
            const piggyApp = new PiggyApp(new PiggybankModelVar());
            piggyApp.model.deleteAllAccounts();  // Ensure there are no records
            const res = await request(piggyApp.app).get("/banks/accounts");
            expect(res.status).toBe(200);
            expect(res.body).toBeArrayOfSize(0);
        });

        // TEST - get all records (non empty)
        it('Should return an array with the correctly added records', async () => {
            const piggyApp = new PiggyApp(new PiggybankModelVar());
            const numElements = Math.floor(Math.random()*10 + 1);
            const dataArr = [];

            // Generate the accounts
            for(let i=0; i<numElements; i++) {
                dataArr.push(generateValidAccount())
            }
            // Create accounts in the model
            piggyApp.model.createBankAccount(dataArr);
            
            const res = await request(piggyApp.app).get("/banks/accounts");
            expect(res.status).toBe(200);
            expect(res.body).toBeArrayOfSize(numElements);
        });
    });


    // TEST SUITE - Post record with wrong data
    describe('POST /banks/accounts', () => {
        let piggyApp: PiggyApp;

        // PREPARE TESTS
        beforeEach(() => {
            piggyApp = new PiggyApp(new PiggybankModelVar());
        });

        // TEST - missing account name
        it('Should fail due to name missing', async () => {
            // Generate a valid account without a name
            let {name, ...accountRecord} = generateValidAccount();

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
            let accountRecord = generateValidAccount();

            // Modify name to exceed constraints
            accountRecord.name = faker.string.sample({min: 31, max: 31});

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
            // Generate a valid account without an iban
            let {iban, ...accountRecord} = generateValidAccount();

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
            let accountRecord = generateValidAccount();

            // Modify iban to exceed constraints
            accountRecord.iban = faker.string.sample({min: 35, max: 35});

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
            let accountRecord = generateValidAccount();

            // Modify closed to exceed constraints
            accountRecord.closed = "wrong date"

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
            // Generate valid account but overwrite comments to be number
            // NOTE: this is done like this to avoid type error if we
            //       first generate the record and then overwrite it with
            //       a number
            let accountRecord = { ...generateValidAccount(), comments: 25 }

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(400);
            expect(res.body).toBeObject();
            expect(res.body).toHaveProperty("err");
            expect(res.body).toHaveProperty("message");
        });

        // TEST - account comments too long
        it('Should fail due to comments too long', async () => {
            let accountRecord = generateValidAccount();

            // Modify iban to exceed constraints
            accountRecord.comments = faker.string.sample({min: 201, max: 201});

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
            const accountRecord = generateValidAccount();

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
        it('Should succeed on correct posting', async () => {
            const accountRecord = generateValidAccount();

            const res = await request(piggyApp.app)
                .post("/banks/accounts")
                .send([accountRecord]);

            expect(res.status).toBe(200);
        });
    });

    // TEST SUITE - PATCH records
    describe('PATCH /banks/accounts/:id', () => {
        let piggyApp: PiggyApp;

        // PREPARE TESTS
        beforeEach(() => {
            const accountRecord = generateValidAccount();

            piggyApp = new PiggyApp(new PiggybankModelVar());

            // Generate a new account record
            piggyApp.model.createBankAccount([accountRecord]);
        });

        // TEST - record not found
        it('Should fail when provided a non existing ID', async () => {
            const modification = {
                name: "test",
            }

            const res = await request(piggyApp.app)
                .post("/banks/accounts/345")
                .send(modification);

            expect(res.status).toBe(404);
        });

        // TEST - name too long
        it('Should fail when name is too long', async () => {
            const modification = {
                name: faker.string.sample({min: 31, max: 31}),
            }

            const res = await request(piggyApp.app)
                .patch("/banks/accounts/1")
                .send(modification);

            expect(res.status).toBe(400);
        });

        // TEST - iban too long
        it('Should fail when iban is too long', async () => {
            const modification = {
                iban: faker.string.sample({min: 35, max: 35}),
            }

            const res = await request(piggyApp.app)
                .patch("/banks/accounts/1")
                .send(modification);

            expect(res.status).toBe(400);
        });

        // TEST - wrong date format
        it('Should fail when date format is wrong', async () => {
            const modification = {
                closed: "wrong date",
            }

            const res = await request(piggyApp.app)
                .patch("/banks/accounts/1")
                .send(modification);

            expect(res.status).toBe(400);
        });

        // TEST - wrong comments format
        it('Should fail when comments format is wrong', async () => {
            const modification = {
                comments: 25
            }

            const res = await request(piggyApp.app)
                .patch("/banks/accounts/1")
                .send(modification);

            expect(res.status).toBe(400);
        });

        // TEST - comments too long
        it('Should fail when comments are too long', async () => {
            const modification = {
                comments: faker.string.sample({min: 201, max: 201}),
            }

            const res = await request(piggyApp.app)
                .patch("/banks/accounts/1")
                .send(modification);

            expect(res.status).toBe(400);
        });

        // TEST - successful update
        it('Should succeed when the update is valid', async () => {
            const modification = generateValidAccount();

            const res = await request(piggyApp.app)
                .patch("/banks/accounts/1")
                .send(modification);

            expect(res.status).toBe(200);
        });
    });

    // TEST SUITE - DELETE records
    describe('DELETE /banks/accounts/:id', () => {
        let piggyApp: PiggyApp;

        // PREPARE TESTS
        beforeEach(() => {
            const accountRecord = generateValidAccount();

            piggyApp = new PiggyApp(new PiggybankModelVar());

            // Generate a new account record
            piggyApp.model.createBankAccount([accountRecord]);
        });

        // TEST - wrong record ID
        it('Should fail when provided a non existing ID', async () => {
            const res = await request(piggyApp.app)
                .delete("/banks/accounts/345")

            expect(res.status).toBe(404);
        });

        // TEST - successful deletion
        it('Should succeed when deleting an existing record', async () => {
            // Get a copy of the bank accounts to later check
            const arr = piggyApp.model.getBankAccounts().slice(0);
            expect(arr).toBeArrayOfSize(1);

            const res = await request(piggyApp.app)
                .delete("/banks/accounts/1")

            expect(res.status).toBe(200);
            expect(piggyApp.model.getBankAccounts()).toBeEmpty();
            
            // Check if the response is correct
            expect(res.body).toMatchObject(arr[0]);
        });
    });
})
