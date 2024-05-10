import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App/App';
import './i18n/config';
import { StyleSheetManager } from 'styled-components';
import isValidProp from '@emotion/is-prop-valid';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';

import { GlobalContexts } from './contexts/GlobalContexts';
import {
    GLOBAL_MODAL_PORTAL_ID,
    supportedNetworks,
    WALLETCONNECT_PROJECT_ID,
} from './ambient-utils/constants';

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
});

createWeb3Modal({
    ethersConfig,
    chains: Object.values(supportedNetworks).map((network) => network.chain),
    projectId: WALLETCONNECT_PROJECT_ID as string,
    enableAnalytics: false,
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
