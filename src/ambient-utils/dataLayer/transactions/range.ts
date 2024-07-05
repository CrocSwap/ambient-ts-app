import { CrocEnv } from '@crocswap-libs/sdk';

type RangePositionTokenInfo = {
    address: string;
    qty: number;
    isWithdrawFromDexChecked: boolean;
};

export interface CreateRangePositionParams {
    crocEnv: CrocEnv;
    isAmbient: boolean;
    slippageTolerancePercentage: number;
    tokenA: RangePositionTokenInfo;
    tokenB: RangePositionTokenInfo;
    isTokenAPrimary: boolean; // TODO: better name for this variable
    tick: { low: number; high: number };
}

export async function createRangePositionTx(params: CreateRangePositionParams) {
    const {
        crocEnv,
        isAmbient,
        slippageTolerancePercentage,
        tokenA,
        tokenB,
        isTokenAPrimary,
        tick,
    } = params;

    const pool = crocEnv.pool(tokenA.address, tokenB.address);
    const poolPrice = await pool.displayPrice();

    const price = {
        min: poolPrice * (1 - slippageTolerancePercentage / 100),
        max: poolPrice * (1 + slippageTolerancePercentage / 100),
    };

    const mintAmbientQuote = () =>
        pool.mintAmbientQuote(tokenA.qty, [price.min, price.max], {
            surplus: [
                tokenA.isWithdrawFromDexChecked,
                tokenB.isWithdrawFromDexChecked,
            ],
        });

    const mintAmbientBase = () =>
        pool.mintAmbientBase(tokenB.qty, [price.min, price.max], {
            surplus: [
                tokenA.isWithdrawFromDexChecked,
                tokenB.isWithdrawFromDexChecked,
            ],
        });

    const mintRangeQuote = () =>
        pool.mintRangeQuote(
            tokenA.qty,
            [tick.low, tick.high],
            [price.min, price.max],
            {
                surplus: [
                    tokenA.isWithdrawFromDexChecked,
                    tokenB.isWithdrawFromDexChecked,
                ],
            },
        );

    const mintRangeBase = () =>
        pool.mintRangeBase(
            tokenB.qty,
            [tick.low, tick.high],
            [price.min, price.max],
            {
                surplus: [
                    tokenA.isWithdrawFromDexChecked,
                    tokenB.isWithdrawFromDexChecked,
                ],
            },
        );

    const tx = isAmbient
        ? await (isTokenAPrimary ? mintAmbientQuote() : mintAmbientBase())
        : await (isTokenAPrimary ? mintRangeQuote() : mintRangeBase());

    return tx;
}
