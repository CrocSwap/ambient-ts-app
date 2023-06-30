import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { TempPoolIF, TokenIF } from '../../utils/interfaces/exports';
import { FetchContractDetailsFn } from '../functions/fetchContractDetails';
import { fetchPoolList } from '../functions/fetchPoolList';

export const usePoolList = (
    cachedTokenDetails: FetchContractDetailsFn,
    tokenUniv: TokenIF[],
    crocEnv?: CrocEnv,
): TempPoolIF[] => {
    const [poolList, setPoolList] = useState<TempPoolIF[]>([]);

    useEffect(() => {
        if (!crocEnv) {
            return undefined;
        }

        const pools = fetchPoolList(crocEnv, tokenUniv, cachedTokenDetails);
        Promise.resolve<TempPoolIF[]>(pools)
            .then((res) => {
                console.log(res);
                return res;
            })
            .then((res) => setPoolList(res))
            .catch((err) => {
                console.error(err);
            });
    }, [crocEnv, tokenUniv, cachedTokenDetails]);

    return poolList;
};
