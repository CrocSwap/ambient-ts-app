import { CrocEnv } from '@crocswap-libs/sdk';

interface PerformSwapParams {
    crocEnv: CrocEnv;
    isQtySell: boolean;
    qty: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    slippageTolerancePercentage: number; // TODO: add comments about params and their expected values
    isWithdrawFromDexChecked?: boolean;
    isSaveAsDexSurplusChecked?: boolean;
}

export async function performSwap(params: PerformSwapParams) {
    const {
        crocEnv,
        isQtySell,
        qty,
        buyTokenAddress,
        sellTokenAddress,
        slippageTolerancePercentage,
        isWithdrawFromDexChecked = true,
        isSaveAsDexSurplusChecked = false,
    } = params;

    const plan = isQtySell
        ? crocEnv.sell(sellTokenAddress, qty).for(buyTokenAddress, {
              slippage: slippageTolerancePercentage / 100,
          })
        : crocEnv.buy(buyTokenAddress, qty).with(sellTokenAddress, {
              slippage: slippageTolerancePercentage / 100,
          });

    const tx = await plan.swap({
        settlement: {
            sellDexSurplus: isWithdrawFromDexChecked,
            buyDexSurplus: isSaveAsDexSurplusChecked,
        },
    });

    return tx;
}
