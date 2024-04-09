import { capitalConcFactor, CrocEnv } from '@crocswap-libs/sdk';
import { PublicClient } from 'viem';

// Approximately 24 hours in Ethereum. TODO make this generalizable across
// chains.
const FIXED_APY_N_BLOCK_LOOKBACK = BigInt(7000);

export async function estimateFrom24HrAmbientApr(
    base: string,
    quote: string,
    crocEnv: CrocEnv,
    publicClient: PublicClient,
    lastBlockNumber: bigint,
): Promise<number> {
    if (!lastBlockNumber) {
        lastBlockNumber = await publicClient.getBlockNumber();
    }

    const lookbackBlockNum =
        BigInt(lastBlockNumber) - FIXED_APY_N_BLOCK_LOOKBACK;
    const lookbackBlock = publicClient.getBlock({
        blockNumber: lookbackBlockNum,
    });

    const nowGrowth = crocEnv
        .pool(base, quote)
        .cumAmbientGrowth(lastBlockNumber);
    const prevGrowth = crocEnv
        .pool(base, quote)
        .cumAmbientGrowth(lookbackBlockNum);

    const periodGrowth = (await nowGrowth) - (await prevGrowth);
    const timeSecs =
        Date.now() / 1000 - Number((await lookbackBlock).timestamp);

    const timeYears = timeSecs / (365 * 24 * 3600);
    return periodGrowth / timeYears;
}

export async function estimateFrom24HrRangeApr(
    rangePercent: number,
    base: string,
    quote: string,
    crocEnv: CrocEnv,
    publicClient: PublicClient,
    lastBlockNumber: bigint,
): Promise<number> {
    const ambientApy = estimateFrom24HrAmbientApr(
        base,
        quote,
        crocEnv,
        publicClient,
        lastBlockNumber,
    );
    const concFactor = capitalConcFactor(
        1.0,
        1.0 - rangePercent,
        1.0 + rangePercent,
    );
    return (await ambientApy) * concFactor;
}
