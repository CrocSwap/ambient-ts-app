import { useEffect, useState } from 'react';
import { TempPoolIF } from '../../utils/interfaces/exports';
import { fetchPoolList } from '../functions/fetchPoolList';

export const usePoolList = (
    chainId: string,
    poolIndex: number,
): TempPoolIF[] => {
    const [poolList, setPoolList] = useState<TempPoolIF[]>([]);

    useEffect(() => {
        const pools = fetchPoolList(chainId, poolIndex);
        Promise.resolve<TempPoolIF[]>(pools)
            // .then((res) => {
            //     console.log(res);
            //     return res;
            // })
            .then((res) => setPoolList(res))
            .catch((err) => {
                console.error(err);
            });
    }, [chainId]);

    return poolList;
};
