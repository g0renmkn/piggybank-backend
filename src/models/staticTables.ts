/**
 * staticTables.ts
 * 
 * File that implements the model for the static tables
 */
export default class StaticTables {
    // Get Movement types
    static getMovementTypes(): string[] {
        return [
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
    }

    // Get Bank Periodicities
    static getBankPeriodicities(): string[] {
        return [
            "one_time",
            "weekly",
            "biweekly",
            "monthly",
            "bimonthly",
            "quarterly",
            "yearly"
        ];
    }

    // Get Asset Types
    static getAssetTypes(): string[] {
        return [
            "fiat",
            "crypto",
            "stock",
            "fund"
        ];
    }
}