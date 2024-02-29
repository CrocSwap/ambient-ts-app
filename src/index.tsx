import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App/App';
import './i18n/config';
import { StyleSheetManager } from 'styled-components';
import isValidProp from '@emotion/is-prop-valid';
import { WagmiConfig, createClient, configureChains, Chain } from 'wagmi';

import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { InjectedConnector } from 'wagmi/connectors/injected';
import { GlobalContexts } from './contexts/GlobalContexts';
import {
    GLOBAL_MODAL_PORTAL_ID,
    supportedNetworks,
} from './ambient-utils/constants';

/* Perform a single forcible reload when the page first loads. Without this, there
 * are issues with Metamask and Chrome preloading. This shortcircuits preloading, at the
 * cost of higher load times, especially when pre-loading isn't happening. See:
 * https://community.metamask.io/t/google-chrome-page-preload-causes-weirdness-with-metamask/24042 */
const doReload = JSON.parse(
    localStorage.getItem('ambiAppReloadTrigger') || 'true',
);
if (doReload) {
    localStorage.setItem('ambiAppReloadTrigger', 'false');
    location.reload();
} else {
    localStorage.setItem('ambiAppReloadTrigger', 'true');
}

// Don't bother rendering page if this is a reload, because it'll slow down the full load
if (!doReload) {
    const { chains, provider, webSocketProvider } = configureChains(
        Object.values(supportedNetworks).map((network) => network.wagmiChain),
        [
            infuraProvider({
                apiKey:
                    process.env.REACT_APP_INFURA_KEY ||
                    '360ea5fda45b4a22883de8522ebd639e', // croc labs #2 // TODO Marking this in the codebase
            }),

            jsonRpcProvider({
                rpc: (chain: Chain) => {
                    if (chain.id === 534352) {
                        return { http: 'https://rpc.scroll.io' };
                    } else if (chain.id === 81457) {
                        return { http: 'https://rpc.ankr.com/blast' };
                    } else if (chain.id === 534351) {
                        return { http: 'https://sepolia-rpc.scroll.io' };
                    } else if (chain.id === 168587773) {
                        return { http: 'https://sepolia.blast.io' };
                    } else {
                        return { http: '' };
                    }
                },
            }),
        ],
    );

    // Set up client
    const client = createClient({
        autoConnect: true,
        connectors: [
            new InjectedConnector({
                chains,
                options: {
                    name: 'MetaMask',
                    shimDisconnect: true,
                },
            }),
            new InjectedConnector({
                chains,
                options: {
                    name: 'Rabby',
                    shimDisconnect: true,
                },
            }),
            new InjectedConnector({
                chains,
                options: {
                    name: 'Brave',
                    shimDisconnect: true,
                },
            }),
            new InjectedConnector({
                chains,
                options: {
                    name: 'Other (Injected) Wallet',
                    shimDisconnect: true,
                },
            }),
        ],
        provider,
        webSocketProvider,
    });

    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement,
    );

    root.render(
        <React.StrictMode>
            <WagmiConfig client={client}>
                <BrowserRouter>
                    <GlobalContexts>
                        <StyleSheetManager
                            shouldForwardProp={(propName) =>
                                isValidProp(propName)
                            }
                        >
                            <App />
                        </StyleSheetManager>

                        <div id={GLOBAL_MODAL_PORTAL_ID} />
                    </GlobalContexts>
                </BrowserRouter>
            </WagmiConfig>
        </React.StrictMode>,
    );
}
