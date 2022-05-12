import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export const useProvider = (chain: string) => {
    const [ropstenProvider, setRopstenProvider] = useState<null | unknown>(null);
    const [kovanProvider, setKovanProvider] = useState<null | unknown>(null);
    const [mainnetProvider, setMainnetProvider] = useState<null | unknown>(null);
    const [fujiProvider, setFujiProvider] = useState<null | unknown>(null);
    const [currentProvider, setCurrentProvider] = useState<null | unknown>(null);

    const makeNewProvider = (node: string) => new ethers.providers.JsonRpcProvider(node);

    useEffect(() => {
        const ropsten = makeNewProvider(
            'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/ropsten',
        );
        const kovan = makeNewProvider(
            'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/kovan',
        );
        const mainnet = makeNewProvider(
            'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/mainnet',
        );
        const fuji = makeNewProvider(
            'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/avalanche/testnet',
        );

        setRopstenProvider(ropsten);
        setMainnetProvider(mainnet);
        setFujiProvider(fuji);
        setKovanProvider(kovan);

        window.ethereum && !currentProvider
            ? setCurrentProvider(makeNewProvider(window.ethereum))
            : setCurrentProvider(kovan);
    }, []);

    useEffect(() => {
        try {
            if (window.ethereum) {
                if (!currentProvider) {
                    const provider = makeNewProvider(window.ethereum);
                    if (currentProvider !== provider) {
                        setCurrentProvider(provider);
                    }
                }
            } else {
                if (chain === '0x1') {
                    if (currentProvider === mainnetProvider) {
                        return;
                    }
                    console.log('switching to mainnet speedynode');
                    setCurrentProvider(mainnetProvider);
                } else if (chain === '0xa869') {
                    if (currentProvider === fujiProvider) {
                        return;
                    }
                    console.log('switching to avalanche testnet speedynode');
                    setCurrentProvider(fujiProvider);
                } else if (chain === '0x2a') {
                    if (currentProvider === kovanProvider) {
                        return;
                    }
                    console.log('switching to kovan testnet speedynode');
                    setCurrentProvider(kovanProvider);
                } else if (chain === '0x3') {
                    if (currentProvider === ropstenProvider) {
                        return;
                    }
                    console.log('switching to ropsten speedynode');
                    setCurrentProvider(ropstenProvider);
                }
            }
        } catch (err) {
            console.warn(err);
        }
    }, [chain]);

    return currentProvider;
};
