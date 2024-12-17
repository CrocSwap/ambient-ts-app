import {
    CrocEnv,
    CrocSmartSwapImpact,
    estimateScrollL1Gas,
} from '@crocswap-libs/sdk';
import { getSwapPlan } from '../../ambient-utils/dataLayer';

interface SimulateSwapParams {
    crocEnv: CrocEnv;
    isQtySell: boolean;
    qty: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    slippageTolerancePercentage: number; // TODO: add comments about params and their expected values
    isWithdrawFromDexChecked?: boolean;
    isSaveAsDexSurplusChecked?: boolean;
    lastImpact: CrocSmartSwapImpact;
}
export const getFauxRawTx = async (
    params: SimulateSwapParams,
): Promise<`0x${string}` | undefined> => {
    const { lastImpact } = params;
    try {
        const plan = getSwapPlan(params);
        const raw = await plan.getFauxRawTx(lastImpact);
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
                    raw,
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
