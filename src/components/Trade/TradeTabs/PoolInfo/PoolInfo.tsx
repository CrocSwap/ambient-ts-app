import { ChainSpec } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { memoizePoolStats } from '../../../../App/functions/getPoolStats';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { formatAmount } from '../../../../utils/numbers';

// interface for props
interface PoolInfoPropsIF {
    chainData: ChainSpec;
    lastBlockNumber: number;
}

const cachedPoolStatsFetch = memoizePoolStats();

// react functional component
export default function PoolInfo(props: PoolInfoPropsIF) {
    const { chainData, lastBlockNumber } = props;

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseTokenAddress = tradeData.baseToken.address;
    const quoteTokenAddress = tradeData.quoteToken.address;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();
    const [poolFees, setPoolFees] = useState<string | undefined>();
    const [poolAPR, setPoolAPR] = useState<string | undefined>();

    useEffect(() => {
        setPoolVolume(undefined);
        setPoolTvl(undefined);
        setPoolFees(undefined);
        setPoolAPR(undefined);
    }, [
        JSON.stringify({ base: tradeData.baseToken.address, quote: tradeData.quoteToken.address }),
    ]);

    const fetchPoolStats = () => {
        (async () => {
            const poolStatsFresh = await cachedPoolStatsFetch(
                chainData.chainId.toString(),
                baseTokenAddress,
                quoteTokenAddress,
                chainData.poolIndex,
                Math.floor(lastBlockNumber / 4),
            );
            const volume = poolStatsFresh?.volume;
            const volumeString = volume ? '$' + formatAmount(volume) : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmount(tvl) : undefined;
            setPoolTvl(tvlString);
            const fees = poolStatsFresh?.fees;
            const feesString = fees ? '$' + formatAmount(fees) : undefined;
            setPoolFees(feesString);
            const apr = poolStatsFresh?.apy;
            const aprString = apr ? formatAmount(apr) + '%' : undefined;
            setPoolAPR(aprString);
        })();
    };

    useEffect(() => {
        fetchPoolStats();
    }, [
        lastBlockNumber,
        JSON.stringify({ base: tradeData.baseToken.address, quote: tradeData.quoteToken.address }),
    ]);

    return (
        <main>
            <p>
                {baseTokenSymbol}: {baseTokenAddress}
            </p>
            <p>
                {quoteTokenSymbol}: {quoteTokenAddress}
            </p>
            <p>24h Swap Volume: {poolVolume || '...'}</p>
            <p>Total Value Locked (TVL): {poolTvl || '...'}</p>
            <p>Total Fees: {poolFees || '...'}</p>
            <p>Total APR: {poolAPR || '...'}</p>
        </main>
    );
}
