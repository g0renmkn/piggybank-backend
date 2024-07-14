export class PiggybankModel {

    /**
     * Get static table of Movement Types
     * 
     * @returns Array of possible values
     */
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


    /**
     * Get static table of Bank Periodicities
     * 
     * @returns Array of possible values
     */
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


    /**
     * Get static table of Asset Types
     * 
     * @returns Array of possible values
     */
    static getAssetTypes(): string[] {
        return [
            "fiat",
            "crypto",
            "stock",
            "fund"
        ];
    }
}
