import { CrocEnv } from '@crocswap-libs/sdk';
import { TransactionResponse } from 'ethers';
import { encodeSurplusArg } from '@crocswap-libs/sdk/dist/encoding/flags';
import {
    ATLAS_REFUND_PERCENT,
    ATLAS_AUCTIONEER_ENDPOINT,
    ATLAS_REFUND_RECIPIENT,
} from '../../constants';
import { Signer } from 'ethers';

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

export async function performFastLaneSwap(params: {
    crocEnv: CrocEnv;
    isQtySell: boolean;
    qty: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    slippageTolerancePercentage: number;
    isWithdrawFromDexChecked?: boolean;
    isSaveAsDexSurplusChecked?: boolean;
}): Promise<TransactionResponse> {
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

    const context = await crocEnv.context;
    const actorAddress = await (context.actor as Signer).getAddress();
    const dexAddress = await context.dex.getAddress();
    const swapQty = await plan.qty;
    const slipQty = await plan.calcSlipQty();
    const limitPrice = await plan.calcLimitPrice();
    const surplusFlags = encodeSurplusArg([
        isWithdrawFromDexChecked,
        isSaveAsDexSurplusChecked,
    ]);

    const unsignedTx = await context.dex.swap.populateTransaction(
        plan.baseToken.tokenAddr,
        plan.quoteToken.tokenAddr,
        context.chain.poolIndex,
        plan.sellBase,
        plan.qtyInBase,
        swapQty,
        0,
        limitPrice,
        slipQty,
        surplusFlags,
    );

    const valueSell = plan.qtyInBase ? swapQty.toString() : slipQty.toString();
    const maxFeePerGas = (await context.provider.getFeeData()).maxFeePerGas;
    const maxFeePerGasHex = maxFeePerGas
        ? '0x' + maxFeePerGas.toString(16)
        : '0xC1B710800';
    const value =
        sellTokenAddress === '0x0000000000000000000000000000000000000000'
            ? valueSell
            : '0x0';
    const payload = {
        jsonrpc: '2.0',
        method: 'atlas_sendUnsignedTransaction',
        params: [
            {
                transaction: {
                    chainId: parseInt(context.chain.chainId),
                    from: actorAddress,
                    to: dexAddress,
                    value: value,
                    data: unsignedTx.data,
                    maxFeePerGas: maxFeePerGasHex,
                },
                refundRecipient: ATLAS_REFUND_RECIPIENT,
                refundPercent: ATLAS_REFUND_PERCENT,
                bidTokenIsOutputToken: true,
            },
        ],
        id: 1,
    };

    const response = await fetch(ATLAS_AUCTIONEER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!result || !result.result) {
        throw new Error('Failed to get transaction response from Atlas');
    }
    if (!context.actor?.sendTransaction) {
        throw new Error('Actor is undefined');
    }
    const txValue = result.result.value
        ? BigInt(result.result.value.toString())
        : 0n;
    const txGasLimit = result.result.gas
        ? BigInt(result.result.gas.toString())
        : undefined;
    const txMaxFeePerGas = result.result.maxFeePerGas
        ? BigInt(result.result.maxFeePerGas.toString())
        : undefined;
    const txResp = await context.actor.sendTransaction({
        to: result.result.to,
        value: txValue,
        gasLimit: txGasLimit,
        maxFeePerGas: txMaxFeePerGas,
        data: result.result.data,
    });
    if (!txResp) {
        throw new Error('Failed to send transaction');
    }
    return txResp;
}
