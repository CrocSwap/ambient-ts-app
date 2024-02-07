import { CrocEnv } from '@crocswap-libs/sdk';

export interface SubmitLimitOrderParams {
    crocEnv: CrocEnv;
    qty: string;
    sellTokenAddress: string;
    buyTokenAddress: string;
    type: 'buy' | 'sell';
    limit: number;
    isWithdrawFromDexChecked?: boolean;
}

export async function submitLimitOrder(params: SubmitLimitOrderParams) {
    const {
        crocEnv,
        qty,
        sellTokenAddress,
        buyTokenAddress,
        type,
        limit,
        isWithdrawFromDexChecked = false,
    } = params;

    let order;
    let ko;
    if (type === 'buy') {
        order = crocEnv.buy(buyTokenAddress, qty);
        ko = order.atLimit(sellTokenAddress, limit);
    } else {
        order = crocEnv.sell(sellTokenAddress, qty);
        ko = order.atLimit(buyTokenAddress, limit);
    }

    if (await ko.willMintFail()) return null;

    const tx = await ko.mint({ surplus: isWithdrawFromDexChecked });

    return tx;
}
