import { Link, useLocation } from 'react-router-dom';
import styles from './TopPoolsCard.module.css';
import { PoolStatsFn } from '../../../../App/functions/getPoolStats';
import { useEffect, useState, useMemo, useContext } from 'react';
import { topPoolIF } from '../../../../App/hooks/useTopPools';
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
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

interface propsIF {
    pool: topPoolIF;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
    crocEnv: CrocEnv | undefined;
}

export default function TopPoolsCard(props: propsIF) {
    const { pool, cachedPoolStatsFetch, crocEnv, cachedFetchTokenPrice } =
        props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const tradeData = useAppSelector((state) => state.tradeData);
    const { pathname } = useLocation();

    const navTarget = useMemo<pageNames>(() => {
        let output: pageNames;
        if (
            pathname.startsWith('/trade/market') ||
            pathname.startsWith('/account') ||
            pathname === '/'
        ) {
            output = 'market';
        } else if (pathname.startsWith('/trade/limit')) {
            output = 'limit';
        } else if (pathname.startsWith('/trade/pool')) {
            output = 'pool';
        } else {
            console.warn(
                'Could not identify the correct URL path for redirect. Using /trade/market as a fallback value. Refer to TopPoolsCard.tsx for troubleshooting.',
            );
            output = 'market';
        }
        return output as pageNames;
    }, [pathname]);

    // hook to generate navigation actions with pre-loaded path
    const linkGenDynamic: linkGenMethodsIF = useLinkGen(navTarget);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    const fetchPoolStats = () => {
        (async () => {
            if (!crocEnv) {
                return;
            }
            const poolStatsFresh = await cachedPoolStatsFetch(
                pool.chainId,
                pool.base.address,
                pool.quote.address,
                pool.poolId,
                Math.floor(Date.now() / 60000),
                crocEnv,
                cachedFetchTokenPrice,
            );
            const volume = poolStatsFresh?.volumeTotalUsd; // display the total volume for all time
            const volumeString = volume
                ? getFormattedNumber({ value: volume, prefix: '$' })
                : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvlTotalUsd;
            const tvlString = tvl
                ? getFormattedNumber({ value: tvl, prefix: '$' })
                : undefined;
            setPoolTvl(tvlString);
        })();
    };

    useEffect(() => {
        fetchPoolStats();
    }, [lastBlockNumber, crocEnv, pool]);

    const tokenAString =
        pool.base.address.toLowerCase() ===
        tradeData.tokenA.address.toLowerCase()
            ? pool.base.address
            : pool.quote.address;

    const tokenBString =
        pool.base.address.toLowerCase() ===
        tradeData.tokenA.address.toLowerCase()
            ? pool.quote.address
            : pool.base.address;

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
                {pool.base.symbol} / {pool.quote.symbol}
            </div>
            <div>{poolVolume ?? '…'}</div>
            <div>{poolTvl ?? '…'}</div>
        </Link>
    );
}
