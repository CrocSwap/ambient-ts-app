import { CrocEnv, CrocImpact } from '@crocswap-libs/sdk';

export const calcImpact = async (
    isQtySell: boolean,
    env: CrocEnv,
    sellTokenAddress: string,
    buyTokenAddress: string,
    slippageTolerancePercentage: number,
    qty: string,
): Promise<CrocImpact> => {
    const impact = await (isQtySell
        ? env.sell(sellTokenAddress, qty).for(buyTokenAddress, {
              slippage: slippageTolerancePercentage,
          }).impact
        : env.buy(buyTokenAddress, qty).with(sellTokenAddress, {
              slippage: slippageTolerancePercentage,
          }).impact);

    // console.log({ impact });
    return impact;
};
