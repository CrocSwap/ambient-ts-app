import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export const useProvider = async () => {
    const [ropstenProvider, setRopstenProvider] = useState<null | unknown>(null);
    const [kovanProvider, setKovanProvider] = useState<null | unknown>(null);
    const [mainnetProvider, setMainnetProvider] = useState<null | unknown>(null);
    const [fujiProvider, setFujiProvider] = useState<null | unknown>(null);
    const [currentProvider, setCurrentProvider] = useState<null | unknown>(null);

    useEffect(() => {
        const makeNewProvider = (node: string) => new ethers.providers.JsonRpcProvider(node);

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
        console.log(window);
        if (window.ethereum) {
            if (!currentProvider) {
                // console.log('setting metamask as current provider');
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setCurrentProvider(provider);
            }
        } else {
            setCurrentProvider(kovan);
        }
        // eslint-disable-next-line
    }, []);
    return true;
};
