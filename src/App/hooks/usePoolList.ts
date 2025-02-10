import { CrocEnv } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import { GCServerPoolIF, PoolIF, TokenIF } from '../../ambient-utils/types';
import { CachedDataContext } from '../../contexts';
import { TokenContext } from '../../contexts/TokenContext';

export const usePoolList = (GCGO_URL: string, crocEnv?: CrocEnv): PoolIF[] => {
    const {
        tokens: { verify, getTokenByAddress, tokenUniv },
    } = useContext(TokenContext);

    const { cachedFetchPoolList } = useContext(CachedDataContext);

    const [poolList, setPoolList] = useState<PoolIF[]>([]);
    useEffect(() => {
        if (!crocEnv) {
            return undefined;
        }

        const pools: Promise<GCServerPoolIF[]> = cachedFetchPoolList();
        Promise.resolve<GCServerPoolIF[]>(pools)
            .then((res: GCServerPoolIF[]) => {
                return res
                    .filter(
                        (result: GCServerPoolIF) =>
                            verify(result.base) && verify(result.quote),
                    )
                    .map((result: GCServerPoolIF) => {
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
