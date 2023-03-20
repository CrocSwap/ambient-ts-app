import { useNavigate } from 'react-router-dom';

// START: Import Local Files
import { formatAmountOld } from '../../../../../utils/numbers';

import styles from '../SidebarSearchResults.module.css';
import { TokenIF, TokenPairIF, TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { useState, useEffect } from 'react';
interface propsIF {
    searchedPools: TempPoolIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    tokenPair: TokenPairIF;
    chainId: string;
    cachedPoolStatsFetch: PoolStatsFn;
}

interface PoolLIPropsIF {
    pool: TempPoolIF;
    chainId: string;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
}

function PoolLI(props: PoolLIPropsIF) {
    const { pool, chainId, getTokenByAddress, handleClick, cachedPoolStatsFetch } = props;

    // hold base and quote token data objects in local state
    const [baseToken, setBaseToken] = useState<TokenIF | null>();
    const [quoteToken, setQuoteToken] = useState<TokenIF | null>();

    // get data objects for base and quote tokens after initial render
    useEffect(() => {
        // array of acknowledged tokens from user data obj in local storage
        const { ackTokens } = JSON.parse(localStorage.getItem('user') as string);
        // fn to check local storage and token map for token data
        const findTokenData = (addr: string, chn: string): TokenIF | undefined => {
            // look for token data obj in token map
            const tokenFromMap: TokenIF | undefined = getTokenByAddress(addr.toLowerCase(), chn);
            // look for token data obj in acknowledged token list
            const tokenFromAckList: TokenIF | undefined = ackTokens.find(
                (ackToken: TokenIF) =>
                    ackToken.chainId === parseInt(chn) &&
                    ackToken.address.toLowerCase() === addr.toLowerCase(),
            );
            // single variable to hold either retrieved token
            const outputToken: TokenIF | undefined = tokenFromMap ?? tokenFromAckList;
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
        <li className={styles.card_container} onClick={() => handleClick(pool.base, pool.quote)}>
            <p>
                {baseToken?.symbol ?? '--'} / {quoteToken?.symbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>{poolVolume ?? '--'}</p>
            <p style={{ textAlign: 'center' }}>{poolTvl ?? '--'}</p>
        </li>
    );
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools, getTokenByAddress, tokenPair, chainId, cachedPoolStatsFetch } = props;

    const navigate = useNavigate();
    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        const { dataTokenA } = tokenPair;
        const tokenAString: string =
            baseAddr.toLowerCase() === dataTokenA.address.toLowerCase() ? baseAddr : quoteAddr;
        const tokenBString: string =
            baseAddr.toLowerCase() === dataTokenA.address.toLowerCase() ? quoteAddr : baseAddr;
        navigate(
            '/trade/market/chain=' +
                chainId +
                '&tokenA=' +
                tokenAString +
                '&tokenB=' +
                tokenBString,
        );
    };

    return (
        <div>
            <h4 className={styles.card_title}>Initialized Pools</h4>
            {searchedPools.length ? (
                <>
                    <header className={styles.header}>
                        <div>Pool</div>
                        <div>Volume</div>
                        <div>TVL</div>
                    </header>
                    <ol className={styles.main_result_container}>
                        {searchedPools.slice(0, 4).map((pool: TempPoolIF) => (
                            <PoolLI
                                key={`sidebar_searched_pool_${JSON.stringify(pool)}`}
                                chainId={chainId}
                                handleClick={handleClick}
                                pool={pool}
                                getTokenByAddress={getTokenByAddress}
                                cachedPoolStatsFetch={cachedPoolStatsFetch}
                            />
                        ))}
                    </ol>
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Pools Found</h5>
            )}
        </div>
    );
}
