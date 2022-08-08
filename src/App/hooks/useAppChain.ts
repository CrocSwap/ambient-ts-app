import {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState
} from 'react';
import { useChain } from 'react-moralis';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { ChainSpec } from '@crocswap-libs/sdk';

export const useAppChain = (defaultChain: string): [ ChainSpec, Dispatch<SetStateAction<string>> ] => {
    const {
        chainId,
        // chain,
        // account
    } = useChain();

    const [ currentChain, setCurrentChain ] = useState(defaultChain);

    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    useEffect(() => {
        if (chainId !== currentChain) {
            chainId ?? console.log(`updating chain to: ${chainId ?? defaultChain}`);
            setCurrentChain(chainId ?? defaultChain);
        }
    }, [chainId]);

    const chainData = useMemo(() => {
        const requestedChain = chainId ?? defaultChain;
        let chn;
        try {
            chn = lookupChain(requestedChain);
        } catch (err) {
            console.warn(err);
            chn = lookupChain(defaultChain);
        }
        return chn;
    }, [chainId]);

    return [ chainData, setCurrentChain ];
}