import {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
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
        // chains, error, isLoading,
        switchNetwork,
    } = useSwitchNetwork();
    // {
    //     onSuccess(data, error) {
    //         console.clear();
    //         console.log('Success', { data, error });
    //         const updatedChainId: string = '0x' + data?.id.toString(16);
    //         console.log({updatedChainId, chainInURLValidated});
    //         if (updatedChainId !== chainInURLValidated) {
    //             console.log('going to index page');
    //             linkGenIndex.navigate();
    //         };
    //     }
    // }

    // metadata on chain authenticated in connected wallet
    const { chain: chainNetwork } = useNetwork();
    useEffect(() => {
        console.log('Network:', chainNetwork);
    }, [chainNetwork?.id]);

    // hook to generate navigation actions with pre-loaded path
    const linkGenCurrent: linkGenMethodsIF = useLinkGen();
    const linkGenIndex: linkGenMethodsIF = useLinkGen('index');

    const dispatch = useAppDispatch();

    const CHAIN_LS_KEY = 'CHAIN_ID';

    // fn to get a chain ID param from the current URL string
    // returns `null` if chain ID is not found or fails validation
    function getChainFromURL(): string | null {
        const { pathname } = window.location;
        let rawURL = pathname;
        let templateURL = '';
        if (rawURL.length && rawURL.includes('chain')) {
            while (!rawURL.startsWith('chain')) {
                rawURL = rawURL.substring(1);
            }
            rawURL = rawURL.substring(6);
            for (let i = 0; i < rawURL.length; i++) {
                const character: string = rawURL[i];
                if (character === '&') break;
                templateURL += character;
            }
        }
        let output: string | null = templateURL.length ? templateURL : null;
        if (typeof output === 'string' && !validateChainId(output)) {
            output = null;
        }
        return output;
    }

    // fn to get a chain ID from the connected wallet
    // returns `null` if no wallet or if network fails validation
    function getChainFromWallet(): string | null {
        let output: string | null = null;
        if (chainNetwork) {
            const chainAsString: string = '0x' + chainNetwork.id.toString(16);
            const isValid: boolean = validateChainId(chainAsString);
            if (isValid) output = chainAsString;
        }
        return output;
    }

    // memoized and validated chain ID from the URL
    const chainInURLValidated: string | null = useMemo(
        () => getChainFromURL(),
        [window.location.pathname],
    );

    // memoized and validated chain ID from the connected wallet
    const chainInWalletValidated = useRef<string | null>(getChainFromWallet());

    // trigger chain switch in wallet when chain in URL changes
    useEffect(() => {
        if (chainInURLValidated && switchNetwork) {
            const isChainValid = validateChainId(chainInURLValidated);
            isChainValid && switchNetwork(parseInt(chainInURLValidated));
        }
    }, [chainInURLValidated, switchNetwork]);

    /*
    Mainnet
    http://localhost:3000/trade/market/chain=0x1&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
    
    Goerli
    http://localhost:3000/trade/market/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05
    */

    // listen for the wallet to change in connected wallet and process that change in the app
    useEffect(() => {
        console.log('wallet updated!');
        if (chainNetwork) {
            // chain ID from wallet (current live value, not memoized in the app)
            const incomingChainFromWallet: string | null = getChainFromWallet();
            // if a wallet is connected, evaluate action to take
            // if none is connected, nullify memoized record of chain ID from wallet
            if (incomingChainFromWallet) {
                // check that the new incoming chain ID is supported by Ambient
                if (validateChainId(incomingChainFromWallet)) {
                    // if wallet chain is valid and does not match record in app, re-initialize
                    // without this gatekeeping the app refreshes itself endlessly
                    if (
                        chainInWalletValidated.current !==
                        incomingChainFromWallet
                    ) {
                        // update preserved chain ID in local storage
                        localStorage.setItem(
                            CHAIN_LS_KEY,
                            incomingChainFromWallet,
                        );
                        // determine if new chain ID from wallet matches URL
                        // if yes, no changes needed
                        // if no, navigate to index page
                        // first part seems unnecessary but appears to help stability
                        // console.log(chainInURLValidated, incomingChainFromWallet);
                        if (chainInURLValidated === incomingChainFromWallet) {
                            // generate params chain manually and navigate user
                            const { pathname } = window.location;
                            let templateURL = pathname;
                            while (templateURL.includes('/')) {
                                templateURL = templateURL.substring(1);
                            }
                            linkGenCurrent.navigate(templateURL);
                            window.location.reload();
                        } else {
                            // navigate to index page
                            linkGenIndex.navigate();
                            window.location.reload;
                        }
                    }
                }
            } else {
                // this should only ever be null
                chainInWalletValidated.current = incomingChainFromWallet;
            }
        }
    }, [chainNetwork?.id]);

    function determineConnected(chainNetwork?: { id: number }): string {
        return chainNetwork
            ? chainNumToString(chainNetwork.id)
            : chainInURLValidated ??
                  (localStorage.getItem(CHAIN_LS_KEY) || defaultChain);
    }

    const defaultChain = getDefaultChainId();

    // value tracking the current chain the app is set to use
    // initializes on the default chain parameter
    // we need this value so the app can be used without a wallet
    const [currentChain, setCurrentChain] = useState(
        getChainFromURL() ?? determineConnected(chainNetwork),
    );

    // value trackng the chain the user or app is trying to switch to
    // If valid, currentChain should converge to this value. For invalid chains
    // the rest of the app should be gated, by not converging currentChain
    const [nextChain, setNextChain] = useState(currentChain);
    // console.log({ currentChain, nextChain });

    // boolean representing if the current chain is supported by the app
    // we use this value to populate the SwitchNetwork.tsx modal
    const [isChainSupported, setIsChainSupported] = useState(
        validateChainId(currentChain),
    );

    // const walletInitialized = useRef(false);

    // If chain switches from wallet, propogate that into currentChain hook
    // useEffect(() => {
    //     // if (chainNetwork) {
    //     //     if (walletInitialized.current) {
    //             setNextChain(determineConnected(chainNetwork));
    //     //     }
    //     //     walletInitialized.current = true;
    //     // }
    // }, [chainNetwork]);

    // This is crude way to handle a chain switch, but without this there is a
    // a lot of dangling providers pointing to the wrong chain that will error and
    // time out, slowing down app performance
    function nukeAndReloadApp(params: string) {
        params ? linkGenCurrent.navigate(params) : linkGenCurrent.navigate();
        window.location.reload();
    }
    // http://localhost:3000/trade/market/chain=0x5&tokenA=0x0000000000000000000000000000000000000000&tokenB=0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05
    // if the chain in metamask changes, update the value in the app to match
    // gatekeeping ensures this only runs when the user changes the chain in metamask
    // gatekeeping also ensures app will not change to an unsupported network
    // TODO: plan for pathways supporting de-authentication
    // useEffect(() => {
    //     // Indicates that we're switching between valid chains. For now we reload
    //     // the app, since there's a lot of downstream dependencies to the provider
    //     if (
    //         validateChainId(nextChain) &&
    //         validateChainId(currentChain) &&
    //         nextChain !== currentChain
    //     ) {
    //         localStorage.setItem(CHAIN_LS_KEY, nextChain);
    //         nukeAndReloadApp();
    //     }

    //     // Only switch currentChain iif valid
    //     if (validateChainId(nextChain)) {
    //         setCurrentChain(nextChain);
    //         dispatch(setChainId(nextChain));
    //         setIsChainSupported(true);
    //     } else {
    //         setIsChainSupported(false);
    //     }
    // }, [nextChain, isUserLoggedIn]);

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

    // make the linter happy so that GitHub can build a deploy preview
    false && setChainId;
    false && isUserLoggedIn;
    false && dispatch;
    false && setCurrentChain;
    false && nextChain;
    false && setIsChainSupported;
    false && nukeAndReloadApp;

    return [chainData, isChainSupported, setNextChain, switchNetwork];
};
