import {
    CrocEnv,
    estimateScrollL1Gas,
    getRawTransaction,
} from '@crocswap-libs/sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

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
export const getSimulatedTx = async (
    params: SimulateSwapParams,
): Promise<TransactionResponse | undefined> => {
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

        const tx = await plan.simulate({
            settlement: {
                sellDexSurplus: isWithdrawFromDexChecked,
                buyDexSurplus: isSaveAsDexSurplusChecked,
            },
        });
        return tx;
    } catch (e) {
        console.log({ e });
        return undefined;
    }
};

export const calcL1Gas = async (
    params: SimulateSwapParams,
): Promise<BigNumber | undefined> => {
    try {
        getSimulatedTx(params).then((tx) => {
            console.log({ tx });
            if (tx) {
                const rawTx = getRawTransaction(tx);
                console.log({ rawTx });
                const scrollL1GasEstimate = estimateScrollL1Gas(
                    params.crocEnv,
                    rawTx as `0x${string}`,
                );
                console.log({ scrollL1GasEstimate });

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
