import { CrocEnv } from '@crocswap-libs/sdk';

interface PerformSwapParams {
    crocEnv: CrocEnv;
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
        qty,
        buyTokenAddress,
        sellTokenAddress,
        slippageTolerancePercentage,
        isWithdrawFromDexChecked = false,
        isSaveAsDexSurplusChecked = true,
    } = params;

    const plan = crocEnv.sell(sellTokenAddress, qty).for(buyTokenAddress, {
        slippage: slippageTolerancePercentage / 100,
    });

    const tx = await plan.swap({
        surplus: [isWithdrawFromDexChecked, isSaveAsDexSurplusChecked],
    });

    return tx;
}
