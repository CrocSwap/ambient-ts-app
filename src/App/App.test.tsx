import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { MoralisProvider } from 'react-moralis';

const APP_ID = 'mVXmmaPDkP1oWs7YcGSqnP3U7qmK7BwUHyrLlqJe';
const SERVER_URL = 'https://kvng1p7egepw.usemoralis.com:2053/server';

test('renders learn react link', () => {
    render(
        <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
            <Router>
                <App />
            </Router>
        </MoralisProvider>,
    );
    const linkElement = screen.getByText(/This is the Page Footer!/i);
    expect(linkElement).toBeInTheDocument();
});
