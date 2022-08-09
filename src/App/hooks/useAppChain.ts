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

export const useAppChain = (
    defaultChain: string
): [
    ChainSpec,
    Dispatch<SetStateAction<string>>
] => {
    const { chainId } = useChain();

    const [ currentChain, setCurrentChain ] = useState(defaultChain);
    useEffect(() => console.log({currentChain}), [currentChain]);

    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    useEffect(() => {
        if (chainId !== currentChain) {
            chainId ?? console.log(`updating chain to: ${chainId ?? defaultChain}`);
            setCurrentChain(chainId ?? defaultChain);
        }
    }, [chainId]);

    const chainData = useMemo(() => {
        let chn;
        try {
            chn = lookupChain(currentChain);
        } catch (err) {
            console.warn(err);
            chn = lookupChain(defaultChain);
        }
        return chn;
    }, [currentChain]);

    return [ chainData, setCurrentChain ];
}