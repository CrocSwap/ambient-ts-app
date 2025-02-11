import { CrocEnv } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import {
    AnalyticsServerPoolIF,
    PoolIF,
    TokenIF,
} from '../../ambient-utils/types';
import { CachedDataContext } from '../../contexts';
import { TokenContext } from '../../contexts/TokenContext';

export const usePoolList = (crocEnv?: CrocEnv): PoolIF[] | undefined => {
    const {
        tokens: { verify, getTokenByAddress, tokenUniv },
    } = useContext(TokenContext);

    const { cachedFetchPoolList } = useContext(CachedDataContext);

    const [poolList, setPoolList] = useState<PoolIF[] | undefined>();
    useEffect(() => {
        if (!crocEnv) {
            return undefined;
        }

        const pools: Promise<AnalyticsServerPoolIF[]> = cachedFetchPoolList();
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
                                base: baseToken, // Overwrite base with the mapped token
                                quote: quoteToken, // Overwrite quote with the mapped token
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
    }, [JSON.stringify(crocEnv), JSON.stringify(tokenUniv)]);

    return poolList;
};
