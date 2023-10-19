import {
    // Dispatch,
    // SetStateAction,
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
import { NetworkIF } from '../../utils/interfaces/exports';
import { supportedNetworks } from '../../utils/networks/index';
import { useSearchParams } from 'react-router-dom';

export const useAppChain = (): {
    chainData: ChainSpec;
    isWalletChainSupported: boolean;
    activeNetwork: NetworkIF;
    chooseNetwork: (network: NetworkIF) => void;
} => {
    // metadata on chain authenticated in connected wallet
    const { chain: chainNetwork, chains: chns } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();

    // hook to generate navigation actions with pre-loaded path
    const linkGenCurrent: linkGenMethodsIF = useLinkGen();
    const linkGenIndex: linkGenMethodsIF = useLinkGen('index');
    const [searchParams] = useSearchParams();
    const chainParam = searchParams.get('chain');
    const networkParam = searchParams.get('network');

    const dispatch = useAppDispatch();

    const CHAIN_LS_KEY = 'CHAIN_ID';

    // fn to get a chain ID param from the current URL string
    // returns `null` if chain ID is not found or fails validation
    // due to where this code is instantiated we can't use param tools
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
            const chainAsString: string = chainNumToString(chainNetwork.id);
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
            switchNetwork(parseInt(chainInURLValidated));
        }
    }, [chainInURLValidated, switchNetwork]);

    // listen for the wallet to change in connected wallet and process that change in the app
    useEffect(() => {
        if (chainNetwork) {
            // chain ID from wallet (current live value, not memoized in the app)
            const incomingChainFromWallet: string | null = getChainFromWallet();
            // if a wallet is connected, evaluate action to take
            // if none is connected, nullify memoized record of chain ID from wallet
            if (incomingChainFromWallet) {
                // check that the new incoming chain ID is supported by Ambient
                if (validateChainId(incomingChainFromWallet)) {
                    // if wallet chain is valid and does not match record in app, update
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
                        const { pathname } = window.location;
                        if (chainInURLValidated === incomingChainFromWallet) {
                            // generate params chain manually and navigate user
                            let templateURL = pathname;
                            while (templateURL.includes('/')) {
                                templateURL = templateURL.substring(1);
                            }
                            linkGenCurrent.navigate(templateURL);
                        } else {
                            if (
                                pathname.includes('token') ||
                                chainParam ||
                                networkParam
                            ) {
                                // navigate to index page only if token pair in URL
                                linkGenIndex.navigate();
                            }
                        }
                        window.location.reload();
                        // update state with new validated wallet network
                        chainInWalletValidated.current =
                            incomingChainFromWallet;
                    }
                }
            } else {
                // this should only ever be null
                chainInWalletValidated.current = incomingChainFromWallet;
            }
        }
    }, [chainNetwork?.id]);

    const defaultChain = getDefaultChainId();

    // metadata about the active network in the app
    const [activeNetwork, setActiveNetwork] = useState<NetworkIF>(
        findNetworkData(
            chainInURLValidated ?? localStorage.getItem(CHAIN_LS_KEY) ?? '0x1',
        ),
    );

    function findNetworkData(chn: keyof typeof supportedNetworks): NetworkIF {
        const output = supportedNetworks[chn];
        // console.log(output);
        return output;
    }
    // logic to update `activeNetwork` when the connected wallet changes networks
    // this doesn't kick in if the user does not have a connected wallet
    useEffect(() => {
        // see if there is a connected wallet with a valid network
        if (chainInWalletValidated.current) {
            // find network metaData for validated wallet
            const chainMetadata: NetworkIF =
                supportedNetworks[chainInWalletValidated.current];
            // if found, update local state with retrieved metadata
            chainMetadata && setActiveNetwork(chainMetadata);
        }
    }, [chainInWalletValidated.current]);

    // fn to allow user to manually switch chains in the app because everything
    // ... else in this file responds to changes in the browser environment
    function chooseNetwork(network: NetworkIF): void {
        localStorage.setItem(CHAIN_LS_KEY, network.chainId);
        setActiveNetwork(network);
        const { pathname } = window.location;
        if (pathname.includes('token')) {
            // navigate to index page only if token pair in URL
            linkGenIndex.navigate();
        }
        window.location.reload();
    }

    // data from the SDK about the current chain in the connected wallet
    // chain is validated upstream of this process
    const chainData = useMemo<ChainSpec>(() => {
        const output: ChainSpec =
            lookupChain(activeNetwork.chainId) ?? lookupChain(defaultChain);
        // sync data in RTK for the new chain
        dispatch(setChainId(output.chainId));
        // return output varibale (chain data)
        return output;
    }, [activeNetwork.chainId]);

    // boolean showing if the current chain in connected wallet is supported
    // this is used to launch the network switcher automatically
    const isWalletChainSupported = useMemo<boolean>(() => {
        // output variable, true by default (when no wallet is connected)
        let isSupported = true;
        // if a wallet is connected, try to validate network
        if (chns.length && chainNetwork) {
            // array of supported chains (number)
            const supportedChains: number[] = chns.map((chn) => chn.id);
            // chain Id of connected network in wallet
            const walletChain: number = chainNetwork.id;
            // determine if connected wallet has a supported chain
            isSupported = supportedChains.includes(walletChain);
        }
        // return output variable
        return isSupported;
    }, [chainNetwork]);

    return {
        chainData,
        isWalletChainSupported,
        activeNetwork,
        chooseNetwork,
    };
};
