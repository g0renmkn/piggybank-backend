import { describe, expect, it, beforeAll } from "bun:test";
import request from 'supertest';
import PiggyApp from '../../app.ts';
import { PiggybankModelVar } from '../../models/PiggybankModelVar.ts';
import { faker } from "@faker-js/faker";


describe('Bank accounts', () => {
    describe('GET /banks/accounts - empty data', () => {
        it('Should return an empty array when no records are yet added', async () => {
            const piggyApp = new PiggyApp(new PiggybankModelVar());
            const res = await request(piggyApp.app).get("/banks/accounts");
            expect(res.status).toBe(200);
            expect(res.body).toBeArrayOfSize(0);
        });
    })

    describe('GET /banks/accounts - non empty data', () => {
        it('Should return an array with the correctly added records', async () => {
            const piggyApp = new PiggyApp(new PiggybankModelVar());
            const numElements = Math.floor(Math.random()*10 + 1);
            const dataArr = [];

            // Generate the accounts
            for(let i=0; i<numElements; i++) {
                dataArr.push({
                    name: faker.company.name(),
                    iban: faker.finance.iban(),
                    closed: "",
                    comments: faker.lorem.paragraph()
                })
            }
            // Create accounts in the model
            piggyApp.model.createBankAccount(dataArr);
            
            const res = await request(piggyApp.app).get("/banks/accounts");
            expect(res.status).toBe(200);
            expect(res.body).toBeArrayOfSize(numElements);
        });
    });

})