import { render, screen } from '@testing-library/react';

import Swap from './Swap';

import { BrowserRouter as Router } from 'react-router-dom';
import { MoralisProvider } from 'react-moralis';

const APP_ID = 'mVXmmaPDkP1oWs7YcGSqnP3U7qmK7BwUHyrLlqJe';
const SERVER_URL = 'https://kvng1p7egepw.usemoralis.com:2053/server';

test('renders Swap() React function instance', () => {
    render(
        <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
            <Router>
                <Swap />
            </Router>
        </MoralisProvider>,
    );
    const swapElement = screen.getByTestId('swap');
    expect(swapElement).toBeInTheDocument();
});
