import { formatAmountOld } from '../../../../../utils/numbers';
import styles from '../SidebarSearchResults.module.css';
import { TokenIF, TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { useState, useEffect } from 'react';
import { ackTokensMethodsIF } from '../../../../hooks/useAckTokens';

interface propsIF {
    pool: TempPoolIF;
    chainId: string;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
    ackTokens: ackTokensMethodsIF;
}

export default function PoolLI(props: propsIF) {
    const {
        pool,
        chainId,
        getTokenByAddress,
        handleClick,
        cachedPoolStatsFetch,
        ackTokens,
    } = props;

    // hold base and quote token data objects in local state
    const [baseToken, setBaseToken] = useState<TokenIF | null>();
    const [quoteToken, setQuoteToken] = useState<TokenIF | null>();

    // get data objects for base and quote tokens after initial render
    useEffect(() => {
        // fn to check local storage and token map for token data
        const findTokenData = (
            addr: string,
            chn: string,
        ): TokenIF | undefined => {
            // look for token data obj in token map
            const tokenFromMap: TokenIF | undefined = getTokenByAddress(
                addr.toLowerCase(),
                chn,
            );
            // look for token data obj in acknowledged tokens list
            const tokenFromAckList: TokenIF | undefined = ackTokens.lookup(
                addr.toLowerCase(),
                chn,
            );
            // single variable to hold either retrieved token
            const outputToken: TokenIF | undefined =
                tokenFromMap ?? tokenFromAckList;
            // return retrieved token data object
            return outputToken;
        };
        // use addresses from pool data to get token data objects
        const baseTokenDataObj = findTokenData(pool.base, pool.chainId);
        const quoteTokenDataObj = findTokenData(pool.quote, pool.chainId);
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
                pool.poolIdx,
                1,
            );
            const volume = poolStatsFresh?.volumeTotal; // display the total volume for all time
            const volumeString = volume
                ? '$' + formatAmountOld(volume)
                : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
            setPoolTvl(tvlString);
        })();
    }, []);

    // note that token symbols displayed in the DOM are from token data, not pool data
    // this is in case a scam token makes it past verification and into the DOM
    // if the app can't find a symbol locally it will not display a value

    return (
        <li
            className={styles.card_container}
            onClick={() => handleClick(pool.base, pool.quote)}
        >
            <p>
                {baseToken?.symbol ?? '--'} / {quoteToken?.symbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>{poolVolume ?? '--'}</p>
            <p style={{ textAlign: 'center' }}>{poolTvl ?? '--'}</p>
        </li>
    );
}
