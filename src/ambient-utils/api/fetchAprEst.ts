import { capitalConcFactor, CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';

// Approximately 24 hours in Ethereum. TODO make this generalizable across
// chains.
const FIXED_APY_N_BLOCK_LOOKBACK = 7000;

export async function estimateFrom24HrAmbientApr(
    base: string,
    quote: string,
    crocEnv: CrocEnv,
    provider: Provider,
    lastBlockNumber: number,
): Promise<number> {
    if (!lastBlockNumber) {
        lastBlockNumber = await provider.getBlockNumber();
    }

    const lookbackBlockNum = lastBlockNumber - FIXED_APY_N_BLOCK_LOOKBACK;
    const lookbackBlock = provider.getBlock(lookbackBlockNum);

    const nowGrowth = crocEnv
        .pool(base, quote)
        .cumAmbientGrowth(Number(lastBlockNumber));
    const prevGrowth = crocEnv
        .pool(base, quote)
        .cumAmbientGrowth(Number(lookbackBlockNum));

    const periodGrowth = (await nowGrowth) - (await prevGrowth);
    const timeSecs =
        Date.now() / 1000 - Number((await lookbackBlock)?.timestamp);

    const timeYears = timeSecs / (365 * 24 * 3600);
    return periodGrowth / timeYears;
}

export function estimateBalancedRangeAprFromPoolApr(
    poolApr: number,
    rangePercent: number,
): number {
    const concFactor = capitalConcFactor(
        1.0,
        1.0 - rangePercent,
        1.0 + rangePercent,
    );
    return rangePercent < 1 ? poolApr * concFactor : poolApr;
}

export function estimateUnbalancedRangeAprFromPoolApr(
    poolApr: number,
    currentPoolPriceNonDisplayNum: number,
    lowPriceNonDisplayNum: number,
    highPriceNonDisplayNum: number,
): number {
    const concFactor = capitalConcFactor(
        currentPoolPriceNonDisplayNum,
        lowPriceNonDisplayNum,
        highPriceNonDisplayNum,
    );
    return poolApr * concFactor;
}

export async function estimateFrom24HrRangeApr(
    rangePercent: number,
    base: string,
    quote: string,
    crocEnv: CrocEnv,
    provider: Provider,
    lastBlockNumber: number,
): Promise<number> {
    const ambientApy = estimateFrom24HrAmbientApr(
        base,
        quote,
        crocEnv,
        provider,
        lastBlockNumber,
    );
    const concFactor = capitalConcFactor(
        1.0,
        1.0 - rangePercent,
        1.0 + rangePercent,
    );
    return (await ambientApy) * concFactor;
}
