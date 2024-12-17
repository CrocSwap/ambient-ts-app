import {
    CrocEnv,
    CrocSmartSwapImpact,
    CrocSmartSwapPoolRouter,
} from '@crocswap-libs/sdk';
import { SinglePoolDataIF } from '../../types';

interface PerformSwapParams {
    crocEnv: CrocEnv;
    isQtySell: boolean;
    qty: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    slippageTolerancePercentage: number; // TODO: add comments about params and their expected values
    isWithdrawFromDexChecked?: boolean;
    isSaveAsDexSurplusChecked?: boolean;
    allPoolStats?: SinglePoolDataIF[];
    directSwapsOnly?: boolean;
}

export function getSwapPlan(params: PerformSwapParams) {
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

    const plan = crocEnv
        .smartSwap(sellTokenAddress, buyTokenAddress, qty, !isQtySell, {
            slippage: slippageTolerancePercentage / 100,
            settlement: {
                fromSurplus: isWithdrawFromDexChecked || false,
                toSurplus: isSaveAsDexSurplusChecked || false,
            },
            disableMultihop: params.directSwapsOnly || false,
        })
        .withRouter(new CrocSmartSwapPoolRouter(params.allPoolStats || []));

    return plan;
}

export async function performSwap(
    params: PerformSwapParams,
    lastImpact: CrocSmartSwapImpact,
) {
    const plan = getSwapPlan(params);
    const tx = await plan.swap(lastImpact);
    return tx;
}
