import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App/App';
import './i18n/config';
import { StyleSheetManager } from 'styled-components';
import isValidProp from '@emotion/is-prop-valid';
import {
    mainnet,
    blast,
    scroll,
    goerli,
    sepolia,
    scrollSepolia,
    blastSepolia,
    Chain,
} from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createConfig, http, fallback, WagmiProvider } from 'wagmi';
import {
    injected,
    // walletConnect
} from 'wagmi/connectors';

import { GlobalContexts } from './contexts/GlobalContexts';
import {
    MAIN_BLAST_RPC_URL,
    FALLBACK_BLAST_RPC_URLS,
    MAIN_SCROLL_RPC_URL,
    FALLBACK_SCROLL_RPC_URLS,
    MAIN_SCROLL_SEPOLIA_RPC_URL,
    FALLBACK_SCROLL_SEPOLIA_RPC_URLS,
    MAIN_BLAST_SEPOLIA_RPC_URL,
    FALLBACK_BLAST_SEPOLIA_RPC_URLS,
    GLOBAL_MODAL_PORTAL_ID,
    supportedNetworks,
    // WALLETCONNECT_PROJECT_ID,
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

const queryClient = new QueryClient();

// Don't bother rendering page if this is a reload, because it'll slow down the full load
if (!doReload) {
    console.log(supportedNetworks);
    const config = createConfig({
        chains: Object.values(supportedNetworks).map(
            (network) => network.wagmiChain,
        ) as unknown as readonly [Chain, ...Chain[]],
        multiInjectedProviderDiscovery: true,
        connectors: [
            injected(),
            // walletConnect({
            //     projectId: WALLETCONNECT_PROJECT_ID || '',
            //     isNewChainsStale: false,
            // })
        ],
        transports: {
            [mainnet.id]: http(),
            [scroll.id]: fallback(
                [MAIN_SCROLL_RPC_URL]
                    .concat(FALLBACK_SCROLL_RPC_URLS)
                    .map((url) => http(url)),
            ),
            [blast.id]: fallback(
                [MAIN_BLAST_RPC_URL]
                    .concat(FALLBACK_BLAST_RPC_URLS)
                    .map((url) => http(url)),
            ),
            [goerli.id]: http(),
            [sepolia.id]: http(),
            [scrollSepolia.id]: fallback(
                [MAIN_SCROLL_SEPOLIA_RPC_URL]
                    .concat(FALLBACK_SCROLL_SEPOLIA_RPC_URLS)
                    .map((url) => http(url)),
            ),
            [blastSepolia.id]: fallback(
                [MAIN_BLAST_SEPOLIA_RPC_URL]
                    .concat(FALLBACK_BLAST_SEPOLIA_RPC_URLS)
                    .map((url) => http(url)),
            ),
        },
        batch: {
            multicall: true,
        },
    });
    const root = ReactDOM.createRoot(
        document.getElementById('root') as HTMLElement,
    );

    root.render(
        <React.StrictMode>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
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
                </QueryClientProvider>
            </WagmiProvider>
        </React.StrictMode>,
    );
}
