import { CrocEnv, CrocSmartSwapImpact } from '@crocswap-libs/sdk';
import { getSwapPlan } from '../../ambient-utils/dataLayer';
import { SinglePoolDataIF } from '../../ambient-utils/types';

// Should be a multiple of `batchMaxCount` from BatchedJsonRpcProvider to
// maximize the number of routes that are evaluated in one `eth_call`.
const MAX_IMPACTS_PER_CALL = 40;

export const calcImpact = async (
    isQtySell: boolean,
    crocEnv: CrocEnv,
    sellTokenAddress: string,
    buyTokenAddress: string,
    slippageTolerancePercentage: number,
    qty: string,
    allPoolStats: SinglePoolDataIF[],
    directSwapsOnly?: boolean,
): Promise<CrocSmartSwapImpact | undefined> => {
    try {
        const plan = getSwapPlan({
            crocEnv,
            isQtySell,
            qty,
            buyTokenAddress,
            sellTokenAddress,
            slippageTolerancePercentage,
            allPoolStats,
            directSwapsOnly,
        });
        return await plan.calcImpacts(MAX_IMPACTS_PER_CALL);

        // For valid pools, the impact calculation will fail only if liquidity
        // in the pool is insufficient
    } catch (e) {
        console.error('calcImpact error:', e);
        return undefined;
    }
};
