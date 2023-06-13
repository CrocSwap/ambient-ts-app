import { Link, useLocation } from 'react-router-dom';
import styles from './RecentPoolsCard.module.css';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useEffect, useState, useMemo, useContext } from 'react';
import { formatAmountOld } from '../../../../utils/numbers';
import { SmallerPoolIF } from '../../../../App/hooks/useRecentPools';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import {
    pageNames,
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { TokenPriceFn } from '../../../../App/functions/fetchTokenPrice';
import { CrocEnv } from '@crocswap-libs/sdk';

interface propsIF {
    pool: SmallerPoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
    crocEnv: CrocEnv | undefined;
}

export default function RecentPoolsCard(props: propsIF) {
    const { pool, cachedPoolStatsFetch, cachedFetchTokenPrice, crocEnv } =
        props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const tradeData = useAppSelector((state) => state.tradeData);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const { pathname } = useLocation();

    const navTarget = useMemo<pageNames>(() => {
        let page: pageNames;
        if (
            pathname.startsWith('/trade/market') ||
            pathname.startsWith('/account')
        ) {
            page = 'market';
        } else if (pathname.startsWith('/trade/limit')) {
            page = 'limit';
        } else if (
            pathname.startsWith('/trade/range') ||
            pathname.startsWith('/trade/reposition')
        ) {
            page = 'range';
        } else {
            console.warn(
                'Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to RecentPoolsCard.tsx for troubleshooting.',
            );
            page = 'market';
        }
        return page as pageNames;
    }, [pathname]);

    // hook to generate navigation actions with pre-loaded path
    const linkGenDynamic: linkGenMethodsIF = useLinkGen(navTarget);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const fetchPoolStatsAsync = () => {
        (async () => {
            if (!crocEnv) {
                return;
            }
            const poolStatsFresh = await cachedPoolStatsFetch(
                chainId,
                pool.baseToken.address,
                pool.quoteToken.address,
                lookupChain(chainId).poolIndex,
                Math.floor(Date.now() / 60000),
                crocEnv,
                cachedFetchTokenPrice,
            );
            // display the total volume for all time
            const volume = poolStatsFresh?.volumeTotalUsd;
            const volumeString = volume
                ? '$' + formatAmountOld(volume)
                : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvlTotalUsd;
            const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
            setPoolTvl(tvlString);
        })();
    };

    useEffect(() => {
        fetchPoolStatsAsync(); // NOTE: we assume that a block occurs more frequently than once a minute
    }, [lastBlockNumber]);

    const tokenAString =
        pool.baseToken.address.toLowerCase() ===
        tradeData.tokenA.address.toLowerCase()
            ? pool.baseToken.address
            : pool.quoteToken.address;

    const tokenBString =
        pool.baseToken.address.toLowerCase() ===
        tradeData.tokenA.address.toLowerCase()
            ? pool.quoteToken.address
            : pool.baseToken.address;

    return (
        <Link
            className={styles.container}
            to={linkGenDynamic.getFullURL({
                chain: chainId,
                tokenA: tokenAString,
                tokenB: tokenBString,
            })}
        >
            <div>
                {pool.baseToken.symbol} / {pool.quoteToken.symbol}
            </div>
            <div>{poolVolume ?? '…'}</div>
            <div>{poolTvl ?? '…'}</div>
        </Link>
    );
}
