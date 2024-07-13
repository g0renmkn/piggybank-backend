/**
 * static.ts
 * 
 * Implementation of the /static route for static table endpoints. No controller needed since this is a very basic endpoint.
 * 
 */
import { Router, type Request, type Response } from "express";

const routes: Router = Router();

routes.get("/movtypes", (req: Request, res: Response) => {
    const movtypes = [
        "deposit",
        "withdrawal",
        "trade",
        "airdrop",
        "mining_reward",
        "fut_open_long",
        "fut_close_long",
        "fut_liq_long",
        "fut_open_short",
        "fut_close_short",
        "fut_liq_short"
    ];

    res.status(200).json(movtypes);
});

routes.get("/bankperiodicities", (req: Request, res: Response) => {
    const periodicities = [
        "one_time",
        "weekly",
        "biweekly",
        "monthly",
        "quarterly",
        "yearly"
    ];

    res.status(200).json(periodicities);
});

routes.get("/assettypes", (req: Request, res: Response) => {
    const assettypes = [
        "fiat",
        "crypto",
        "stock",
        "fund"
    ];

    res.status(200).json(assettypes);
});

export default routes;