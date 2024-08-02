import { describe, expect, it, beforeAll } from "bun:test";
import request from 'supertest';
import PiggyApp from '../../app.ts';
import { PiggybankModelVar } from '../../models/PiggybankModelVar.ts';


describe('Bank accounts', () => {
    describe('GET /banks/accounts', () => {
        let piggyApp: PiggyApp;
        let model: PiggybankModelVar;
    
        beforeAll(() => {
            model = new PiggybankModelVar();
            piggyApp = new PiggyApp(model);
        });

        it('Should return an empty array when no records are yet added', async () => {
            const res = await request(piggyApp.app).get("/banks/accounts");
            expect(res.status).toBe(200);
            expect(res.body).toBeArrayOfSize(0);
        });
    })

})