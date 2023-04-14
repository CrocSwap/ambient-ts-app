import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ChainSpec } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { getDefaultChainId, validateChainId } from '../../utils/data/chains';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { setChainId } from '../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import { useNavigate } from 'react-router-dom';
import { current } from '@reduxjs/toolkit';

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

    const defaultChain = getDefaultChainId();
    const chainId = chain ? '0x' + chain.id.toString(16) : defaultChain;
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

    // This is crude way to handle a chain switch, but without this there is a
    // a lot of dangling providers pointing to the wrong chain that will error and
    // time out, slowing down app performance
    function nukeAndReloadApp() {
        navigate('/');
        window.location.reload();
    }

    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    // gatekeeping also ensures app will not change to an unsupported network
    // TODO: plan for pathways supporting de-authentication
    useEffect(() => {
        // If wallet is connected, don't worry about validating chain, should
        // be correct be default
        if (!isUserLoggedIn) {
            return;
        }

        // Logic to run if the chain ID has switched
        if (chainId && chainId !== currentChain) {
            /* Core of this logic is that currentChain *only* updates when chain
             * has switched to a supported chain. Three type of user-initiated chain
             * chain switches are possible:
             *
             *    1) Valid -> valid chain switch: Reset entire app (see comments above) */
            if (validateChainId(chainId) && validateChainId(currentChain)) {
                nukeAndReloadApp();

                /*    2) Invalid -> valid chain switch: Update currentChain, which cascades app
                 *                  back to valid state */
            } else if (validateChainId(chainId)) {
                setCurrentChain(chainId);
                setIsChainSupported(true);

                /*    3) Valid/invalid -> invalid chain switch: Turn off isChainSupported, which
                 *                        triggers blocking downstream */
            } else {
                setIsChainSupported(false);
            }
        }
    }, [chainId, currentChain, isUserLoggedIn]);

    // data from the SDK about the current chain
    // refreshed every time the the value of currentChain is updated
    const chainData = useMemo(() => {
        let chn;
        try {
            chn = lookupChain(currentChain);
            dispatch(setChainId(currentChain));
        } catch (err) {
            console.error(err);
            setCurrentChain(defaultChain);
            chn = lookupChain(defaultChain);
        }
        return chn;
    }, [currentChain]);

    return [chainData, isChainSupported, setCurrentChain, switchNetwork];
};
