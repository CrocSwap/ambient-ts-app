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
import { validateChainId } from '../../utils/data/chains';

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

    // if there's a chain ID from moralis and it validates, switch app to default chain
    useEffect(() => {
        console.log(chainId);
        chainId && console.log(validateChainId(chainId));
        if (chainId && !validateChainId(chainId)) switchNetwork(defaultChain);
    }, []);

    // change the network in Moralis after user changes in the app
    useEffect(() => {
        if (chainId !== currentChain) switchNetwork(currentChain);
    }, [currentChain]);

    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    // gatekeeping also ensures app will not change to an unsupported network
    useEffect(() => {
        // only take action if Moralis and app have different chains
        // also chain must be in the chains.ts array of supported chains
        if (
            (chainId) &&
            (chainId !== currentChain)
        ) {
            setCurrentChain(validateChainId(chainId) ? chainId : defaultChain);
        }
    }, [chainId]);

    const isChainSupported = useMemo(() => {
        return validateChainId(currentChain);
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