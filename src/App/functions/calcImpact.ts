import { CrocEnv, CrocImpact } from '@crocswap-libs/sdk';

export const calcImpact = async (
    isQtySell: boolean,
    env: CrocEnv,
    sellTokenAddress: string,
    buyTokenAddress: string,
    slippageTolerancePercentage: number,
    qty: string,
): Promise<CrocImpact | undefined> => {
    try {
        const args = { slippage: slippageTolerancePercentage };
        const swapPlan = isQtySell
            ? env.sell(sellTokenAddress, qty).for(buyTokenAddress, args)
            : env.buy(buyTokenAddress, qty).with(sellTokenAddress, args);
        return swapPlan.impact;

        // For valid pools, the impact calculation will fail only if liquidity
        // in the pool is insufficient
    } catch (e) {
        return undefined;
    }
};
