import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../test-utils';

import Range from './Range';

import { MoralisProvider } from 'react-moralis';

const APP_ID = 'mVXmmaPDkP1oWs7YcGSqnP3U7qmK7BwUHyrLlqJe';
const SERVER_URL = 'https://kvng1p7egepw.usemoralis.com:2053/server';

test('renders Market() React function instance', () => {
    renderWithRouter(
        <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
            <Range />
        </MoralisProvider>,
    );
    const rangeElement = screen.getByTestId('range');
    expect(rangeElement).toBeInTheDocument();
});
