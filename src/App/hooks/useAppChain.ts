import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ChainSpec } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { validateChainId } from '../../utils/data/chains';
import { useNetwork, useSwitchNetwork } from 'wagmi';

export const useAppChain = (
    defaultChain: string,
    isUserLoggedIn: boolean | undefined,
): [
    ChainSpec,
    boolean,
    Dispatch<SetStateAction<string>>,
    ((chainId_?: number | undefined) => void) | undefined,
] => {
    // chain from connected wallet via Moralis

    const {
        // chains, error, isLoading, pendingChainId,
        switchNetwork,
    } = useSwitchNetwork();

    const { chain } = useNetwork();

    const chainId = chain ? '0x' + chain.id.toString(16) : '';

    // value tracking the current chain the app is set to use
    // initializes on the default chain parameter
    // we need this value so the app can be used without a wallet
    const [currentChain, setCurrentChain] = useState(defaultChain);
    // boolean representing if the current chain is supported by the app
    // we use this value to populate the SwitchNetwork.tsx modal
    const [isChainSupported, setIsChainSupported] = useState(validateChainId(defaultChain));

    // change the network in Moralis after user changes in the app
    // useEffect(() => {
    //     console.log('change chain in Moralis!');
    //     if (isWeb3Enabled && chainId !== currentChain) switchNetwork(currentChain);
    // }, [currentChain, isWeb3Enabled]);

    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    // gatekeeping also ensures app will not change to an unsupported network
    // TODO: plan for pathways supporting de-authentication
    useEffect(() => {
        // console.log({ chainId });
        // if Moralis has a chain ID which does not match the in-app chain ID
        //      Moralis chain ID is supported => switch app to that ID
        //      Moralis chain Id is NOT supported => switch app to default chain
        if (isUserLoggedIn) {
            if (chainId && chainId !== currentChain) {
                if (validateChainId(chainId)) {
                    setCurrentChain(chainId);
                } else if (!validateChainId(chainId)) {
                    setIsChainSupported(false);
                } else {
                    console.warn(
                        `Issue validating network. Received value <<${chainId}>> from Moralis. Refer to useAppChain.ts for debugging why equality check crashed. Refer to chains.ts file for acceptable values.`,
                    );
                }
                // if Moralis and local state are already on the same chain,
                // ... indicate chain is supported in local state
            } else if (chainId === currentChain) {
                setIsChainSupported(true);
            }
        }

        // }
    }, [chainId, currentChain, isUserLoggedIn]);

    // useEffect(() => {
    //     if (chainId !== currentChain) setIsChainSupported(false);
    // }, [chainId, currentChain]);

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

    return [chainData, isChainSupported, setCurrentChain, switchNetwork];
};
