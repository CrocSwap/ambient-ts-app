import {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState
} from 'react';
import { useChain } from 'react-moralis';
import { ChainSpec } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

export const useAppChain = (
    defaultChain: string
): [
    ChainSpec,
    boolean,
    Dispatch<SetStateAction<string>>
] => {
    // chain from connected wallet via Moralis
    const { chainId, switchNetwork } = useChain();

    // value tracking the current chain the app is set to use
    // initializes on the default chain parameter 
    const [ currentChain, setCurrentChain ] = useState(defaultChain);
    useEffect(() => console.log({currentChain}), [currentChain]);

    // change the network in Moralis after user changes in the app
    useEffect(() => {
        if (chainId !== currentChain) switchNetwork(currentChain);
    }, [currentChain]);

    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    useEffect(() => {
        // only take action if Moralis and app have different chains
        if (chainId !== currentChain) {
            chainId ?? console.log(`updating chain to: ${chainId ?? defaultChain}`);
            setCurrentChain(chainId ?? defaultChain);
        }
    }, [chainId]);

    const isChainSupported = useMemo(() => {
        const supportedChains = ['0x5'];
        return supportedChains.includes(currentChain);
    }, [currentChain]);

    // data from the SDK about the current chain
    // refreshed every time the the value of currentChain is updated
    const chainData = useMemo(() => {
        let chn;
        try {
            chn = lookupChain(currentChain);
        } catch (err) {
            console.warn(err);
            setCurrentChain(defaultChain);
            chn = lookupChain(defaultChain);
        }
        return chn;
    }, [currentChain]);

    return [ chainData, isChainSupported, setCurrentChain ];
}