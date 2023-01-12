import { useEffect, useState } from 'react';
import { TempPoolIF } from '../../utils/interfaces/exports';
import { fetchPoolList } from '../functions/fetchPoolList';

export const usePoolList = (chainId: string, poolIndex: number): TempPoolIF[] => {
    const [poolList, setPoolList] = useState<TempPoolIF[]>([]);

    useEffect(() => {
        const pools = fetchPoolList(chainId, poolIndex);
        Promise.resolve<TempPoolIF[]>(pools)
            .then(res => setPoolList(res))
            .catch(err => console.warn(err));
    }, [chainId]);

    useEffect(() => {
        console.log({ poolList });
    }, [JSON.stringify(poolList)]);

    return poolList;
}