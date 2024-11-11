import { useEffect, useMemo, useState } from 'react';
import { useWeb3ModalAccount, useSwitchNetwork } from '@web3modal/ethers/react';
import {
    getDefaultChainId,
    validateChainId,
    chainNumToString,
    checkEoaHexAddress,
} from '../../ambient-utils/dataLayer';
import { useLinkGen, linkGenMethodsIF } from '../../utils/hooks/useLinkGen';
import { chainIds, NetworkIF } from '../../ambient-utils/types';
import { getNetworkData, supportedNetworks } from '../../ambient-utils/constants';

export const useAppChain = (): {
    activeNetwork: NetworkIF;
    chooseNetwork: (network: NetworkIF) => void;
} => {
    // metadata on chain authenticated in connected wallet
    const { chainId: walletChainId } = useWeb3ModalAccount();
    const { switchNetwork } = useSwitchNetwork();
    // hook to generate navigation actions with pre-loaded path
    const linkGenCurrent: linkGenMethodsIF = useLinkGen();
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    const linkGenSwap: linkGenMethodsIF = useLinkGen('swap');
    const [ignoreFirst, setIgnoreFirst] = useState<boolean>(true);

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
        if (walletChainId) {
            const chainAsString: string = chainNumToString(walletChainId);
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
    const [chainInWalletValidated, setChainInWalletValidated] = useState<string|null>(getChainFromWallet());
    const [x, setX] = useState<boolean>(true);
    false && setX;
    useEffect(() => {
        const incomingChainFromWallet: string | null = getChainFromWallet();
        if (incomingChainFromWallet) {
            const networkData: NetworkIF = getNetworkData(incomingChainFromWallet as chainIds);
            chooseNetwork(networkData);
        }
    }, [x]);

    // listen for the wallet to change in connected wallet and process that change in the app
    useEffect(() => {
        if (walletChainId) {
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
                        chainInWalletValidated !==
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

                        const isPathENS = pathname.slice(1)?.includes('.eth');
                        /*  check if path is 42 character hex string 
                            after removing the first character for /{hex} URLs 
                            or first 9 characters for /account/{hex} */
                        const isPathHexEoaAddress =
                            checkEoaHexAddress(pathname);
                        const isPathUserAddress =
                            isPathENS || isPathHexEoaAddress;

                        const isPathUserXpOrLeaderboard =
                            pathname.includes('/xp');
                        const isPathPointsTabOnAccount =
                            pathname.includes('/points');
                        const isPathOnAccount = pathname.includes('/account');
                        const isPathOnExplore = pathname.includes('/explore');
                        const isPathOnAuctions = pathname.includes('/auctions');

                        if (chainInURLValidated === incomingChainFromWallet) {
                            // generate params chain manually and navigate user
                            let templateURL = pathname;
                            while (templateURL.includes('/')) {
                                templateURL = templateURL.substring(1);
                            }
                            console.log('reloading 4');
                            linkGenCurrent.navigate(templateURL);
                        } else {
                            if (
                                linkGenCurrent.currentPage === 'initpool' ||
                                linkGenCurrent.currentPage === 'reposition'
                            ) {
                                linkGenPool.navigate(
                                    `chain=${incomingChainFromWallet}`,
                                );
                            } else if (pathname.includes('chain')) {
                                if (!ignoreFirst) {
                                    console.log('reloading 1');
                                    linkGenCurrent.navigate(
                                        `chain=${incomingChainFromWallet}`,
                                    );
                                } else {
                                    console.log('reloading 2');
                                    setIgnoreFirst(false);
                                    if (chainInURLValidated)
                                        switchNetwork(
                                            parseInt(chainInURLValidated),
                                        );
                                    return;
                                }
                            } else if (
                                isPathUserAddress ||
                                isPathOnAccount ||
                                isPathPointsTabOnAccount ||
                                isPathOnAuctions ||
                                isPathUserXpOrLeaderboard ||
                                isPathOnExplore
                            ) {
                                if (
                                    activeNetwork.chainId !=
                                    incomingChainFromWallet
                                ) {
                                    window.location.reload();
                                }
                            } else {
                                console.log('reloading 3');
                                linkGenCurrent.navigate();
                            }
                        }
                        if (activeNetwork.chainId != incomingChainFromWallet) {
                            window.location.reload();
                        } else {
                            setIgnoreFirst(false);
                        }
                        // update state with new validated wallet network
                        setChainInWalletValidated(incomingChainFromWallet);
                    }
                }
            } else {
                // this should only ever be null
                setChainInWalletValidated(incomingChainFromWallet);
            }
        }
    }, [walletChainId, chainInWalletValidated]);

    const defaultChain = getDefaultChainId();

    // metadata about the active network in the app
    const [activeNetwork, setActiveNetwork] = useState<NetworkIF>(
        findNetworkData(
            chainInURLValidated
                ? chainInURLValidated
                : (localStorage.getItem(CHAIN_LS_KEY) ?? defaultChain),
        ) || findNetworkData(defaultChain),
    );

    function findNetworkData(chn: keyof typeof supportedNetworks): NetworkIF {
        const output = supportedNetworks[chn];
        return output;
    }
    // logic to update `activeNetwork` when the connected wallet changes networks
    // this doesn't kick in if the user does not have a connected wallet
    useEffect(() => {
        // see if there is a connected wallet with a valid network
        if (chainInWalletValidated) {
            // find network metaData for validated wallet
            const chainMetadata: NetworkIF =
                supportedNetworks[chainInWalletValidated];
            // if found, update local state with retrieved metadata
            chainMetadata && setActiveNetwork(chainMetadata);
        }
    }, [chainInWalletValidated !== null]);

    // fn to allow user to manually switch chains in the app because everything
    // ... else in this file responds to changes in the browser environment
    function chooseNetwork(network: NetworkIF): void {
        localStorage.setItem(CHAIN_LS_KEY, network.chainId);
        const { pathname } = window.location;

        setActiveNetwork(network);
        const isPathENS = pathname.slice(1)?.includes('.eth');
        const isPathHexEoaAddress = checkEoaHexAddress(pathname);
        const isPathUserAddress = isPathENS || isPathHexEoaAddress;
        const isPathUserXpOrLeaderboard = pathname.includes('/xp');
        if (
            linkGenCurrent.currentPage === 'initpool' ||
            linkGenCurrent.currentPage === 'reposition'
        ) {
            linkGenPool.navigate(`chain=${network.chainId}`);
        } else if (linkGenCurrent.currentPage === 'swap') {
            linkGenSwap.navigate(`chain=${network.chainId}`);
        } else if (pathname.includes('chain')) {
            console.log('navigating 6');
            linkGenCurrent.navigate(`chain=${network.chainId}`);
        } else if (isPathUserAddress || isPathUserXpOrLeaderboard) {
            // this one is specific to user account pages
            // !IMPORTANT:  not this one
            window.location.reload();
        } else {
            console.log('navigating 5');
            linkGenCurrent.navigate();
        }
        // this one seems to be necessary for chain switching, when disabled
        // ... the app appears to switch chains but doesn't get any pool data
        // window.location.reload();
    }

    return {
        activeNetwork,
        chooseNetwork,
    };
};
