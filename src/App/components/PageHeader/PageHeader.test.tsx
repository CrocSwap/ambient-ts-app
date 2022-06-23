import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../test-utils';

import PageHeader from './PageHeader';
import { MoralisProvider } from 'react-moralis';

const APP_ID = 'mVXmmaPDkP1oWs7YcGSqnP3U7qmK7BwUHyrLlqJe';
const SERVER_URL = 'https://kvng1p7egepw.usemoralis.com:2053/server';

test.skip('renders PageHeader() React function instance', () => {
    renderWithRouter(
        <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
            <PageHeader />
        </MoralisProvider>,
    );
    const pageHeaderElement = screen.getByTestId('page-header');
    expect(pageHeaderElement).toBeInTheDocument();
});
