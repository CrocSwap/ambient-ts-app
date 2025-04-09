import { CrocEnv } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import {
    AnalyticsServerPoolIF,
    PoolIF,
    TokenIF,
} from '../../ambient-utils/types';
import { AppStateContext, CachedDataContext } from '../../contexts';
import { TokenContext } from '../../contexts/TokenContext';

export const usePoolList = (crocEnv?: CrocEnv): PoolIF[] | undefined => {
    const {
        tokens: { verify, getTokenByAddress, tokenUniv },
    } = useContext(TokenContext);

    const {
        isUserIdle,
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { cachedFetchPoolList } = useContext(CachedDataContext);

    const [poolList, setPoolList] = useState<PoolIF[] | undefined>();

    const poolListRefreshTime = isUserIdle
        ? Math.floor(Date.now() / 120000) // 2 minute interval if  idle
        : Math.floor(Date.now() / 30000); // 30 second interval if not idle

    useEffect(() => {
        if (!crocEnv) {
            return undefined;
        }
        const pools: Promise<AnalyticsServerPoolIF[]> =
            cachedFetchPoolList(chainId);
        Promise.resolve<AnalyticsServerPoolIF[]>(pools)
            .then((res: AnalyticsServerPoolIF[]) => {
                return res
                    .filter(
                        (result: AnalyticsServerPoolIF) =>
                            verify(result.base) && verify(result.quote),
                    )
                    .map((result: AnalyticsServerPoolIF) => {
                        const baseToken: TokenIF | undefined =
                            getTokenByAddress(result.base);
                        const quoteToken: TokenIF | undefined =
                            getTokenByAddress(result.quote);
                        if (baseToken && quoteToken) {
                            return {
                                ...result, // Spreads all properties of result
                                baseToken, // Overwrite base with the mapped token
                                quoteToken, // Overwrite quote with the mapped token
                            };
                        } else {
                            return null;
                        }
                    })

                    .filter((pool: PoolIF | null) => pool !== null) as PoolIF[];
            })
            .then((pools) => {
                setPoolList(pools);
            })
            .catch((err) => console.error(err));
    }, [
        crocEnv === undefined,
        chainId,
        JSON.stringify(tokenUniv),
        getTokenByAddress,
        verify,
        poolListRefreshTime,
    ]);

    return poolList;
};
