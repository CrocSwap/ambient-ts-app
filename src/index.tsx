import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { store } from './utils/state/store';
import { Provider } from 'react-redux';
import './index.css';
import App from './App/App';
import reportWebVitals from './reportWebVitals';
// import { MoralisProvider } from 'react-moralis';
import './i18n/config.ts';

import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { goerli, arbitrumGoerli } from 'wagmi/chains';

import { infuraProvider } from 'wagmi/providers/infura';
// import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
// import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
// import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

// console.log(process.env.NODE_ENV);
// console.log(process.env.REACT_APP_INFURA_KEY);

const { chains, provider, webSocketProvider } = configureChains(
    [goerli, arbitrumGoerli],
    [
        infuraProvider({
            apiKey:
                process.env.REACT_APP_INFURA_KEY ||
                '360ea5fda45b4a22883de8522ebd639e', // croc labs #2
        }),
        // alchemyProvider({
        //     apiKey: process.env.REACT_APP_ALCHEMY_ID || '88xHXjBMB59mzC1VWXFCCg8dICKJZOqS',
        // }),
        publicProvider(),
    ],
);

// Set up client
const client = createClient({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
        // new CoinbaseWalletConnector({
        //     chains,
        //     options: {
        //         appName: 'Ambient Finance',
        //     },
        // }),
        // new WalletConnectConnector({
        //     chains,
        //     options: {
        //         qrcode: true,
        //     },
        // }),
        new InjectedConnector({
            chains,
            options: {
                name: 'Brave',
                shimDisconnect: true,
            },
        }),
    ],
    provider,
    webSocketProvider,
});

// const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
// const APP_ID = 'mVXmmaPDkP1oWs7YcGSqnP3U7qmK7BwUHyrLlqJe';
// const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
// const SERVER_URL = 'https://kvng1p7egepw.usemoralis.com:2053/server';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);

root.render(
    <React.StrictMode>
        <WagmiConfig client={client}>
            <Provider store={store}>
                {/* <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}> */}
                <BrowserRouter>
                    <App />
                </BrowserRouter>
                {/* </MoralisProvider> */}
            </Provider>
        </WagmiConfig>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
