import { useEffect, useState } from 'react';
import { TokenIF, TempPoolIF } from '../../../../../utils/interfaces/exports';
import styles from '../SidebarSearchResults.module.css';
import { formatAmountOld } from '../../../../../utils/numbers';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { tokenMethodsIF } from '../../../../hooks/useToken';

interface propsIF {
    pool: TempPoolIF;
    chainId: string;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
    uTokens: tokenMethodsIF;
}

export default function PoolLI(props: propsIF) {
    const { pool, chainId, handleClick, cachedPoolStatsFetch, uTokens } = props;

    // hold base and quote token data objects in local state
    const [baseToken, setBaseToken] = useState<TokenIF | null>();
    const [quoteToken, setQuoteToken] = useState<TokenIF | null>();

    // get data objects for base and quote tokens after initial render
    useEffect(() => {
        // use addresses from pool data to get token data objects
        const baseTokenDataObj = uTokens.getTokenByAddress(pool.base, pool.chainId);
        const quoteTokenDataObj = uTokens.getTokenByAddress(pool.quote, pool.chainId);
        // send token data objects to local state
        baseTokenDataObj && setBaseToken(baseTokenDataObj);
        quoteTokenDataObj && setQuoteToken(quoteTokenDataObj);
    }, []);

    // volume of pool to be displayed in the DOM
    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    // TVL of pool to be displayed in the DOM
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    // logic to pull current values of volume and TVL for pool
    // this runs once and does not update after initial load
    useEffect(() => {
        (async () => {
            const poolStatsFresh = await cachedPoolStatsFetch(
                chainId,
                pool.base,
                pool.quote,
                pool.poolIdx ?? 36000,
                1,
            );
            const volume = poolStatsFresh?.volumeTotal; // display the total volume for all time
            const volumeString = volume ? '$' + formatAmountOld(volume) : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
            setPoolTvl(tvlString);
        })();
    }, []);

    // note that token symbols displayed in the DOM are from token data, not pool data
    // this is in case a scam token makes it past verification and into the DOM
    // if the app can't find a symbol locally it will not display a value

    // TODO:  @Junior please refactor the top-level element in the JSX return as an <li>
    // TODO:  ... this needs to be part and parcel with nesting instances in an <ol> element

    return (
        <div className={styles.card_container} onClick={() => handleClick(pool.base, pool.quote)}>
            <p>
                {baseToken?.symbol ?? '--'} / {quoteToken?.symbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>{poolVolume ?? '--'}</p>
            <p style={{ textAlign: 'center' }}>{poolTvl ?? '--'}</p>
        </div>
    );
}
