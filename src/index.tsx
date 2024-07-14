import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App/App';
import './i18n/config';
import { StyleSheetManager } from 'styled-components';
import isValidProp from '@emotion/is-prop-valid';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';

import { GlobalContexts } from './contexts/GlobalContexts';
import {
    GLOBAL_MODAL_PORTAL_ID,
    supportedNetworks,
    WALLETCONNECT_PROJECT_ID,
} from './ambient-utils/constants';
import scrollLogo from './assets/images/networks/scroll_logo.webp';
import blastLogo from './assets/images/networks/blast_logo.png';
import blastSepoliaLogo from './assets/images/networks/blast_sepolia_logo.webp';
import scrollSepoliaLogo from './assets/images/networks/scroll_sepolia_logo.webp';
import sepoliaLogo from './assets/images/networks/sepolia_logo.webp';
import ethLogo from './assets/images/networks/ethereum_logo.svg';

/* Perform a single forcible reload when the page first loads. Without this, there
 * are issues with Metamask and Chrome preloading. This shortcircuits preloading, at the
 * cost of higher load times, especially when pre-loading isn't happening. See:
 * https://community.metamask.io/t/google-chrome-page-preload-causes-weirdness-with-metamask/24042
 *
 * Still happening as of May 2024 using Metamask v11.15.4 on Chrome 124. */
const doReload =
    JSON.parse(localStorage.getItem('ambiAppReloadTrigger') || 'true') &&
    navigator.userAgent.includes('Chrome');
if (doReload) {
    localStorage.setItem('ambiAppReloadTrigger', 'false');
    location.reload();
} else {
    localStorage.setItem('ambiAppReloadTrigger', 'true');
}

const metadata = {
    name: 'Ambient Finance',
    description:
        'Swap cryptocurrencies like a pro with Ambient. Decentralized trading is now better than ever',
    url: 'https://ambient.finance', // origin must match your domain & subdomain
    icons: [
        'https://ambient.finance/apple-touch-icon.png',
        'https://ambient.finance/favicon-32x32.png',
        'https://ambient.finance/favicon-16x16.png',
    ],
};

const ethersConfig = defaultConfig({
    metadata,
    defaultChainId: 1,
    enableEmail: false,
    rpcUrl: ' ',
    coinbasePreference: 'smartWalletOnly',
});

const modal = createWeb3Modal({
    ethersConfig,
    chains: Object.values(supportedNetworks).map((network) => network.chain),
    projectId: WALLETCONNECT_PROJECT_ID as string,
    chainImages: {
        1: ethLogo,
        81457: blastLogo,
        168587773: blastSepoliaLogo,
        534351: scrollSepoliaLogo,
        534352: scrollLogo,
        11155111: sepoliaLogo,
    },
    termsConditionsUrl: '/terms',
    privacyPolicyUrl: '/privacy',
    enableAnalytics: false,
    themeVariables: {
        '--w3m-color-mix': 'var(--dark2)',
        '--w3m-color-mix-strength': 10,
        '--w3m-font-family': 'var(--font-family)',
        '--w3m-accent': 'var(--accent1)',
    },
});

modal.subscribeEvents((event) => {
    const networkIds = Object.values(supportedNetworks).map(
        (network) => network.chain.chainId,
    );
    if (
        event.data.event === 'MODAL_CLOSE' &&
        event.data.properties.connected === true
    ) {
        if (networkIds.includes(modal.getState().selectedNetworkId)) {
            // prevents the 'unknown account #0' bug
            window.location.reload();
        } else {
            // prevents user's wallet from remaining connected to an unsupported network
            modal.disconnect();
        }
    }
});

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <GlobalContexts>
                <StyleSheetManager
                    shouldForwardProp={(propName) => isValidProp(propName)}
                >
                    <App />
                </StyleSheetManager>

                <div id={GLOBAL_MODAL_PORTAL_ID} />
            </GlobalContexts>
        </BrowserRouter>
    </React.StrictMode>,
);
