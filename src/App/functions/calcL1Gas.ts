import { CrocEnv, estimateScrollL1Gas } from '@crocswap-libs/sdk';

interface SimulateSwapParams {
    crocEnv: CrocEnv;
    isQtySell: boolean;
    qty: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    slippageTolerancePercentage: number; // TODO: add comments about params and their expected values
    isWithdrawFromDexChecked?: boolean;
    isSaveAsDexSurplusChecked?: boolean;
}
export const getFauxRawTx = async (
    params: SimulateSwapParams,
): Promise<string | undefined> => {
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
    try {
        const plan = isQtySell
            ? crocEnv.sell(sellTokenAddress, qty).for(buyTokenAddress, {
                  slippage: slippageTolerancePercentage / 100,
              })
            : crocEnv.buy(buyTokenAddress, qty).with(sellTokenAddress, {
                  slippage: slippageTolerancePercentage / 100,
              });

        const raw = await plan.getFauxRawTx({
            settlement: {
                sellDexSurplus: isWithdrawFromDexChecked,
                buyDexSurplus: isSaveAsDexSurplusChecked,
            },
        });
        return raw;
    } catch (e) {
        console.log({ e });
        return undefined;
    }
};

export const calcL1Gas = async (
    params: SimulateSwapParams,
): Promise<bigint | undefined> => {
    try {
        return getFauxRawTx(params).then(async (raw) => {
            if (raw) {
                const scrollL1GasEstimate = await estimateScrollL1Gas(
                    params.crocEnv,
                    raw as `0x${string}`,
                );

                return scrollL1GasEstimate;
            } else {
                console.log('returning undefined');
                return undefined;
            }
        });
    } catch (error) {
        console.log({ error });
        return undefined;
    }
};
