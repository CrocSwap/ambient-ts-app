import { useEffect, useState } from 'react';
import { TokenIF, TempPoolIF } from '../../../../../utils/interfaces/exports';
import styles from '../SidebarSearchResults.module.css';
import { formatAmountOld } from '../../../../../utils/numbers';
import { memoizePoolStats } from '../../../../functions/getPoolStats';

interface propsIF {
    pool: TempPoolIF;
    chainId: string;
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
}

export default function PoolLI(props: propsIF) {
    const { pool, chainId, getTokenByAddress, handleClick } = props;

    // hold base and quote token data objects in local state
    const [baseToken, setBaseToken] = useState<TokenIF|null>();
    const [quoteToken, setQuoteToken] = useState<TokenIF|null>();

    // get data objects for base and quote tokens after initial render
    useEffect(() => {
        // array of acknowledged tokens from user data obj in local storage
        const { ackTokens } = JSON.parse(localStorage.getItem('user') as string);
        // fn to check local storage and token map for token data
        const findTokenData = (addr:string, chn:string): TokenIF => {
            // look for token data obj in token map
            const tokenFromMap = getTokenByAddress(addr.toLowerCase(), chn);
            // look for token data obj in acknowledged token list
            const tokenFromAckList = ackTokens.find(
                (ackToken: TokenIF) => (
                    ackToken.chainId === parseInt(chn) &&
                    ackToken.address.toLowerCase() === addr.toLowerCase()
                )
            );
            // single variable to hold either retrieved token
            const outputToken = tokenFromMap ?? tokenFromAckList;
            // return retrieved token data object
            return outputToken;
        }
        // use addresses from pool data to get token data objects
        const baseTokenDataObj = findTokenData(pool.base, pool.chainId);
        const quoteTokenDataObj = findTokenData(pool.quote, pool.chainId);
        // send token data objects to local state
        baseTokenDataObj && setBaseToken(baseTokenDataObj);
        quoteTokenDataObj && setQuoteToken(quoteTokenDataObj);
    }, []);

    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    useEffect(() => {
        const fetchPoolStats = () => {
            const cachedPoolStatsFetch = memoizePoolStats();
            async () => {
                const poolStatsFresh = await cachedPoolStatsFetch(
                    chainId,
                    pool.base,
                    pool.quote,
                    pool.poolIdx ?? 36000,
                    1,
                );
                const volume = poolStatsFresh?.volume;
                const volumeString = volume ? '$' + formatAmountOld(volume) : undefined;
                setPoolVolume(volumeString);
                const tvl = poolStatsFresh?.tvl;
                const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
                setPoolTvl(tvlString);
            };
        };
        fetchPoolStats();
    }, []);

    console.log({poolVolume, poolTvl})

    return (
        <div
            className={styles.card_container}
            onClick={() => handleClick(pool.base, pool.quote)}
        >
            <div>{baseToken?.symbol ?? '--'} + {quoteToken?.symbol ?? '--'}</div>
            <div>{poolVolume}</div>
            <div>{poolTvl}</div>
        </div>
    );
}