import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../utils/state/store';
import Swap from './Swap';

import { BrowserRouter } from 'react-router-dom';
import { MoralisProvider } from 'react-moralis';

const APP_ID = 'mVXmmaPDkP1oWs7YcGSqnP3U7qmK7BwUHyrLlqJe';
const SERVER_URL = 'https://kvng1p7egepw.usemoralis.com:2053/server';

test.skip('renders Swap() React function instance', () => {
    render(
        <Provider store={store}>
            <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
                <BrowserRouter>
                    <Swap />
                </BrowserRouter>
            </MoralisProvider>
        </Provider>,
    );
    const swapElement = screen.getByTestId('swap');
    expect(swapElement).toBeInTheDocument();
});
