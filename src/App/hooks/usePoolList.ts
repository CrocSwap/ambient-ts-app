import { useEffect, useState } from 'react';
import { TempPoolIF } from '../../utils/interfaces/exports';
import { fetchPoolList } from '../functions/fetchPoolList';

export const usePoolList = (chainId: string) => {
    console.log('fired custom hook usePoolList() in App.tsx');
    const [poolList, setPoolList] = useState<TempPoolIF[]>([]);

    useEffect(() => {
        const pools = fetchPoolList(chainId);
        Promise.resolve(pools)
            .then(res => setPoolList(res))
            .catch(err => console.warn(err));
    }, [chainId]);

    useEffect(() => {
        if (poolList.length) console.log({ poolList });
    }, [poolList]);
}