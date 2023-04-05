import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { store } from './utils/state/store';
import { Provider } from 'react-redux';
import './index.css';
import App from './App/App';
import reportWebVitals from './reportWebVitals';
import './i18n/config.ts';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { avalanche, goerli, avalancheFuji } from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { HelmetProvider } from 'react-helmet-async';

const { chains, provider, webSocketProvider } = configureChains(
    [goerli, avalanche, avalancheFuji],
    [
        infuraProvider({
            apiKey:
                process.env.REACT_APP_INFURA_KEY ||
                '360ea5fda45b4a22883de8522ebd639e', // croc labs #2
        }),
        publicProvider(),
    ],
);

// Set up client
const client = createClient({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
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
                <BrowserRouter>
                    <HelmetProvider>
                        <App />
                    </HelmetProvider>
                </BrowserRouter>
            </Provider>
        </WagmiConfig>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
