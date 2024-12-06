import { CrocEnv } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import { fetchPoolList } from '../../ambient-utils/api';
import { GCServerPoolIF, PoolIF, TokenIF } from '../../ambient-utils/types';
import { AppStateContext } from '../../contexts';
import { TokenContext } from '../../contexts/TokenContext';

export const usePoolList = (GCGO_URL: string, crocEnv?: CrocEnv): PoolIF[] => {
    const {
        activeNetwork: { poolIndex },
    } = useContext(AppStateContext);
    const {
        tokens: { verify, getTokenByAddress, tokenUniv },
    } = useContext(TokenContext);

    const [poolList, setPoolList] = useState<PoolIF[]>([]);

    useEffect(() => {
        if (!crocEnv) {
            return undefined;
        }

        const pools: Promise<GCServerPoolIF[]> = fetchPoolList(
            crocEnv,
            GCGO_URL,
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
