export interface LiquidityCurveServerIF {
    ambientLiq: number;
    liquidityBumps: {
        bumpTick: number;
        liquidityDelta: number;
        latestUpdateTime: number;
    }[];
}
