import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ChainSpec } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { getDefaultChainId, validateChainId } from '../../utils/data/chains';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import {
    setChainId,
    setTokenA,
    setTokenB,
} from '../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { useNavigate } from 'react-router-dom';
import { getDefaultPairForChain } from '../../utils/data/defaultTokens';

export const useAppChain = (
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
    const defaultChain = getDefaultChainId();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // value tracking the current chain the app is set to use
    // initializes on the default chain parameter
    // we need this value so the app can be used without a wallet
    const [currentChain, setCurrentChain] = useState(chainId);

    // boolean representing if the current chain is supported by the app
    // we use this value to populate the SwitchNetwork.tsx modal
    const [isChainSupported, setIsChainSupported] = useState(
        validateChainId(defaultChain),
    );

    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    // gatekeeping also ensures app will not change to an unsupported network
    // TODO: plan for pathways supporting de-authentication
    useEffect(() => {
        if (isUserLoggedIn) {
            if (chainId && chainId !== currentChain) {
                if (validateChainId(chainId)) {
                    setCurrentChain(chainId);

                    if (validateChainId(currentChain)) {
                        navigate('/');
                    }
                } else if (!validateChainId(chainId)) {
                    setIsChainSupported(false);
                } else {
                    console.error(
                        `Issue validating network. Received value <<${chainId}>>. Refer to useAppChain.ts for debugging why equality check crashed. Refer to chains.ts file for acceptable values.`,
                    );
                }
            } else if (chainId === currentChain) {
                setIsChainSupported(true);
            }
        }
    }, [chainId, currentChain, isUserLoggedIn]);

    // data from the SDK about the current chain
    // refreshed every time the the value of currentChain is updated
    const chainData = useMemo(() => {
        let chn;
        try {
            chn = lookupChain(currentChain);
            dispatch(setChainId(chainId));
        } catch (err) {
            console.error(err);
            setCurrentChain(defaultChain);
            chn = lookupChain(defaultChain);
        }
        return chn;
    }, [currentChain]);

    return [chainData, isChainSupported, setCurrentChain, switchNetwork];
};
