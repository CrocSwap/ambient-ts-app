import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { ChainSpec } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { getDefaultChainId, validateChainId } from '../../utils/data/chains';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { setChainId } from '../../utils/state/tradeDataSlice';
import { useAppDispatch } from '../../utils/hooks/reduxToolkit';
import chainNumToString from '../functions/chainNumToString';
import { useLinkGen, linkGenMethodsIF } from '../../utils/hooks/useLinkGen';

export const useAppChain = (
    isUserLoggedIn: boolean | undefined,
): [
    ChainSpec,
    boolean,
    Dispatch<SetStateAction<string>>,
    ((chainId_?: number | undefined) => void) | undefined,
] => {
    const {
        // chains, error, isLoading, pendingChainId,
        switchNetwork,
    } = useSwitchNetwork();

    const CHAIN_LS_KEY = 'CHAIN_ID';

    const { chain: chainNetwork } = useNetwork();

    function determineConnected(chainNetwork?: { id: number }): string {
        return chainNetwork
            ? chainNumToString(chainNetwork.id)
            : localStorage.getItem(CHAIN_LS_KEY) || defaultChain;
    }

    const defaultChain = getDefaultChainId();
    const dispatch = useAppDispatch();

    // hook to generate navigation actions with pre-loaded path
    const linkGenIndex: linkGenMethodsIF = useLinkGen('index');

    // value tracking the current chain the app is set to use
    // initializes on the default chain parameter
    // we need this value so the app can be used without a wallet
    const [currentChain, setCurrentChain] = useState(
        determineConnected(chainNetwork),
    );

    // value trackng the chain the user or app is trying to switch to
    // If valid, currentChain should converge to this value. For invalid chains
    // the rest of the app should be gated, by not converging currentChain
    const [nextChain, setNextChain] = useState(currentChain);

    // boolean representing if the current chain is supported by the app
    // we use this value to populate the SwitchNetwork.tsx modal
    const [isChainSupported, setIsChainSupported] = useState(
        validateChainId(currentChain),
    );

    // If chain switches from wallet, propogate that into currentChain hook
    useEffect(() => {
        setNextChain(determineConnected(chainNetwork));
    }, [chainNetwork]);

    // This is crude way to handle a chain switch, but without this there is a
    // a lot of dangling providers pointing to the wrong chain that will error and
    // time out, slowing down app performance
    function nukeAndReloadApp() {
        linkGenIndex.navigate();
        window.location.reload();
    }

    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    // gatekeeping also ensures app will not change to an unsupported network
    // TODO: plan for pathways supporting de-authentication
    useEffect(() => {
        // Indicates that we're switching between valid chains. For now we reload
        // the app, since there's a lot of downstream dependencies to the provider
        if (
            validateChainId(nextChain) &&
            validateChainId(currentChain) &&
            nextChain !== currentChain
        ) {
            localStorage.setItem(CHAIN_LS_KEY, nextChain);
            nukeAndReloadApp();
        }

        // Only switch currentChain iif valid
        if (validateChainId(nextChain)) {
            setCurrentChain(nextChain);
            dispatch(setChainId(nextChain));
            setIsChainSupported(true);
        } else {
            setIsChainSupported(false);
        }
    }, [nextChain, isUserLoggedIn]);

    // data from the SDK about the current chain
    // refreshed every time the the value of currentChain is updated
    const chainData = useMemo(() => {
        let chn;
        try {
            chn = lookupChain(currentChain);
        } catch (err) {
            console.error(err);
            chn = lookupChain(defaultChain);
        }
        return chn;
    }, [currentChain]);

    return [chainData, isChainSupported, setNextChain, switchNetwork];
};
