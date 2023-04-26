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

import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { getWagmiChains } from './utils/data/chains';

const { chains, provider, webSocketProvider } = configureChains(
    getWagmiChains(),
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
        new InjectedConnector({
            chains,
            options: {
                name: 'Injected',
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
