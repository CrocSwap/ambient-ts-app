import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Provider } from '@ethersproject/providers';

export const useMainnetProvider = () => {
    const [mainnetProvider, setMainnetProvider] = useState<
        Provider | undefined
    >();

    useEffect(() => {
        const infuraKey = process.env.REACT_APP_INFURA_KEY
            ? process.env.REACT_APP_INFURA_KEY
            : '62d8ac2df76d4c839efd81b063e99f81'; // croc labs

        const mainnetProvider = new ethers.providers.JsonRpcProvider(
            'https://mainnet.infura.io/v3/' + infuraKey, // croc labs
        );
        setMainnetProvider(mainnetProvider);
    }, []);

    return mainnetProvider;
};
