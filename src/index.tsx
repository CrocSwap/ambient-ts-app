import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { store } from './utils/state/store';
import { Provider } from 'react-redux';
import './index.css';
import App from './App/App';
import './i18n/config';
import { StyleSheetManager } from 'styled-components';
import isValidProp from '@emotion/is-prop-valid';
import { WagmiConfig, createClient, configureChains } from 'wagmi';

import { infuraProvider } from 'wagmi/providers/infura';

import { InjectedConnector } from 'wagmi/connectors/injected';
import { GLOBAL_MODAL_PORTAL_ID } from './constants';
import { GlobalContexts } from './contexts/GlobalContexts';
import { supportedNetworks } from './utils/networks';

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
                    '360ea5fda45b4a22883de8522ebd639e', // croc labs #2
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
                <Provider store={store}>
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
                </Provider>
            </WagmiConfig>
        </React.StrictMode>,
    );
}
