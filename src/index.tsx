import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { store } from './utils/state/store';
import { Provider } from 'react-redux';
import './index.css';
import App from './App/App';
import reportWebVitals from './reportWebVitals';
import { MoralisProvider } from 'react-moralis';

// const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const APP_ID = 'mVXmmaPDkP1oWs7YcGSqnP3U7qmK7BwUHyrLlqJe';
// const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;
const SERVER_URL = 'https://kvng1p7egepw.usemoralis.com:2053/server';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </MoralisProvider>
        </Provider>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
