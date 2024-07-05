import { CrocEnv } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import { GCServerPoolIF } from '../../ambient-utils/types';
import { fetchPoolList } from '../../ambient-utils/api';
import { TokenContext } from '../../contexts/TokenContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';

// this file exists because we need to be able to access the full list of pools
// ... on-chain and existing logic removes pools where either token is unknown

export const usePoolList2 = (
    graphCacheUrl: string,
    crocEnv?: CrocEnv,
): GCServerPoolIF[] => {
    const {
        tokens: { tokenUniv },
    } = useContext(TokenContext);
    const { chainData } = useContext(CrocEnvContext);

    const [poolList, setPoolList] = useState<GCServerPoolIF[]>([]);

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
                    // temporary filter until gcgo filters on poolIdx
                    res.filter((pool) => pool.poolIdx === chainData.poolIndex)
                );
            })
            .then((pools) => setPoolList(pools))
            .catch((err) => console.error(err));
    }, [crocEnv, tokenUniv]);

    return poolList;
};
