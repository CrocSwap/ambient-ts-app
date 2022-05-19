import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test-utils';

import Trade from './Trade';

test('renders Trade() React function instance', () => {
    renderWithRouter(<Trade />);
    const tradeElement = screen.getByTestId('trade');
    expect(tradeElement).toBeInTheDocument();
});
