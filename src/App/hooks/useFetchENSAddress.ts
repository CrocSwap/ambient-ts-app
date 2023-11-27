import { useEffect, useState } from 'react';
import { fetchENSAddress } from '../functions/fetchENSAddress';

export const useFetchENSAddress = (address: string) => {
    const [ensAddress, setEnsAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const ensAddress = await fetchENSAddress(address);
            setEnsAddress(ensAddress);
            setIsLoading(false);
        })();
    }, [address]);

    return {
        ensAddress,
        isLoading,
    };
};
