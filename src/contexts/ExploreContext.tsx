import { ReactNode, createContext, useContext, useRef, useState } from 'react';
import { CachedDataContext } from './CachedDataContext';
import { ChainDataContext } from './ChainDataContext';
import { CrocEnv, toDisplayPrice } from '@crocswap-libs/sdk';
import { PoolIF } from '../utils/interfaces/exports';
import { getMoneynessRank } from '../utils/functions/getMoneynessRank';
import { getFormattedNumber } from '../App/functions/getFormattedNumber';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { get24hChange } from '../App/functions/getPoolStats';

export interface ExploreContextIF {
    pools: {
        retrievedAt: number | null;
        all: PoolDataIF[];
        getAll: (poolList: PoolIF[], crocEnv: CrocEnv, chainId: string) => void;
        autopoll: {
            allowed: boolean;
            enable: () => void;
            disable: () => void;
        };
    };
}

export interface PoolDataIF extends PoolIF {
    spotPrice: number;
    displayPrice: string;
    poolIdx: number;
    tvl: number;
    tvlStr: string;
    volume: number;
    volumeStr: string;
    priceChange: number;
    priceChangeStr: string;
    moneyness: {
        base: number;
        quote: number;
    };
}

export const ExploreContext = createContext<ExploreContextIF>(
    {} as ExploreContextIF,
);

export const ExploreContextProvider = (props: { children: ReactNode }) => {
    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        cachedPoolStatsFetch,
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
    } = useContext(CachedDataContext);

    const [allPools, setAllPools] = useState<PoolDataIF[]>([]);
    const [retrievedAt, setRetrievedAt] = useState<number | null>(null);

    // fn to get data on a single pool
    async function getPoolData(
        pool: PoolIF,
        crocEnv: CrocEnv,
        chainId: string,
    ): Promise<PoolDataIF> {
        // moneyness of base token
        const baseMoneyness: number = getMoneynessRank(pool.base.symbol);
        // moneyness of quote token
        const quoteMoneyness: number = getMoneynessRank(pool.quote.symbol);
        // determination to invert based on relative moneyness
        const shouldInvert: boolean = quoteMoneyness - baseMoneyness >= 0;
        // spot price for pool
        const spotPrice: number = await cachedQuerySpotPrice(
            crocEnv,
            pool.base.address,
            pool.quote.address,
            chainId,
            lastBlockNumber,
        );
        // display price, inverted if necessary
        const displayPrice: number = shouldInvert
            ? 1 /
              toDisplayPrice(spotPrice, pool.base.decimals, pool.quote.decimals)
            : toDisplayPrice(
                  spotPrice,
                  pool.base.decimals,
                  pool.quote.decimals,
              );
        // pool index
        const poolIdx: number = lookupChain(chainId).poolIndex;

        const poolStats = await cachedPoolStatsFetch(
            chainId,
            pool.base.address,
            pool.quote.address,
            poolIdx,
            Math.floor(Date.now() / 60000),
            crocEnv,
            cachedFetchTokenPrice,
        );
        // format TVL, use empty string as backup value
        const tvlDisplay: string = poolStats.tvlTotalUsd
            ? getFormattedNumber({
                  value: poolStats.tvlTotalUsd,
                  isTvl: true,
                  prefix: '$',
              })
            : '';
        // format volume, use empty string as backup value
        const volumeDisplay: string = poolStats.volumeTotalUsd
            ? getFormattedNumber({
                  value: poolStats.volumeTotalUsd,
                  prefix: '$',
              })
            : '';
        // human readable price change over last 24 hours
        let priceChangePercent: string;
        const priceChangeRaw: number | undefined = await get24hChange(
            chainId,
            pool.base.address,
            pool.quote.address,
            poolIdx,
            shouldInvert,
        );
        if (!priceChangeRaw) {
            priceChangePercent = '';
        } else if (priceChangeRaw * 100 >= 0.01) {
            priceChangePercent =
                '+ ' +
                (priceChangeRaw * 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }) +
                '%';
        } else if (priceChangeRaw * 100 <= -0.01) {
            priceChangePercent =
                (priceChangeRaw * 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }) + '%';
        } else {
            priceChangePercent = 'No Change';
        }
        // return variable
        const poolData: PoolDataIF = {
            ...pool,
            spotPrice,
            displayPrice: getFormattedNumber({
                value: displayPrice,
                abbrevThreshold: 10000000, // use 'm', 'b' format > 10m
            }),
            poolIdx,
            tvl: poolStats.tvlTotalUsd,
            tvlStr: tvlDisplay,
            volume: poolStats.volumeTotalUsd,
            volumeStr: volumeDisplay,
            priceChange: priceChangeRaw ?? 0,
            priceChangeStr: priceChangePercent,
            moneyness: {
                base: baseMoneyness,
                quote: quoteMoneyness,
            },
        };
        // write a pool name should it not be there already
        poolData.name =
            baseMoneyness < quoteMoneyness
                ? `${pool.base.symbol} / ${pool.quote.symbol}`
                : `${pool.quote.symbol} / ${pool.base.symbol}`;
        return poolData;
    }

    // meta function to apply pool data get fn to an array of pools
    function getAllPoolData(
        poolList: PoolIF[],
        crocEnv: CrocEnv,
        chainId: string,
    ): void {
        setAllPools([]);
        setRetrievedAt(null);
        const allPoolData = poolList.map((pool: PoolIF) =>
            getPoolData(pool, crocEnv, chainId),
        );
        Promise.all(allPoolData)
            .then((results: PoolDataIF[]) => {
                setAllPools(results);
                setRetrievedAt(Date.now());
            })
            .catch((err) => {
                console.warn(err);
                // re-enable autopolling to attempt more data fetches
                enableAutopollPools();
                setRetrievedAt(null);
            });
    }

    // limiter and controllers to prevent rapid-fire autopolling of infura
    const allowAutopollPools = useRef(true);
    function enableAutopollPools() {
        allowAutopollPools.current = true;
    }
    function disableAutopollPools() {
        allowAutopollPools.current = false;
    }

    const exploreContext: ExploreContextIF = {
        pools: {
            retrievedAt,
            all: allPools,
            getAll: getAllPoolData,
            autopoll: {
                allowed: allowAutopollPools.current,
                enable: () => enableAutopollPools(),
                disable: () => disableAutopollPools(),
            },
        },
    };

    return (
        <ExploreContext.Provider value={exploreContext}>
            {props.children}
        </ExploreContext.Provider>
    );
};
