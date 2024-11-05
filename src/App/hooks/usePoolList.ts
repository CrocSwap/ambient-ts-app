import { CrocEnv } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import { PoolIF, GCServerPoolIF, TokenIF } from '../../ambient-utils/types';
import { fetchPoolList } from '../../ambient-utils/api';
import { TokenContext, TokenContextIF } from '../../contexts/TokenContext';
import { AppStateContext } from '../../contexts';
import { AppStateContextIF } from '../../contexts/AppStateContext';

export const usePoolList = (
    graphCacheUrl: string,
    crocEnv?: CrocEnv,
): PoolIF[] => {
    const {
        activeNetwork: { poolIndex },
    } = useContext<AppStateContextIF>(AppStateContext);
    const {
        tokens: { verify, getTokenByAddress, tokenUniv },
    } = useContext<TokenContextIF>(TokenContext);

    const [poolList, setPoolList] = useState<PoolIF[]>([]);

    useEffect(() => {
        if (!crocEnv) {
            return undefined;
        }

        const pools: Promise<GCServerPoolIF[]> = fetchPoolList(
            crocEnv,
            graphCacheUrl,
        );
        Promise.resolve<GCServerPoolIF[]>(pools)
            .then((res: GCServerPoolIF[]) => {
                return (
                    res
                        .filter(
                            (result: GCServerPoolIF) =>
                                verify(result.base) && verify(result.quote),
                        )
                        // temporary filter until gcgo filters on poolIdx
                        .filter((pool) => pool.poolIdx === poolIndex)
                        .map((result: GCServerPoolIF) => {
                            const baseToken: TokenIF | undefined =
                                getTokenByAddress(result.base);
                            const quoteToken: TokenIF | undefined =
                                getTokenByAddress(result.quote);
                            if (baseToken && quoteToken) {
                                return {
                                    base: baseToken,
                                    quote: quoteToken,
                                    chainId: result.chainId,
                                    poolIdx: result.poolIdx,
                                };
                            } else {
                                return null;
                            }
                        })
                        .filter(
                            (pool: PoolIF | null) => pool !== null,
                        ) as PoolIF[]
                );
            })
            .then((pools) => setPoolList(pools))
            .catch((err) => console.error(err));
    }, [crocEnv, tokenUniv]);

    return poolList;
};
