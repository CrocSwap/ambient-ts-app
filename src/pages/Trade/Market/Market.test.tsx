import { render, screen } from '@testing-library/react';

import Market from './Market';

test('renders Market() React function instance', () => {
    render(<Market />);
    const marketElement = screen.getByTestId('market');
    expect(marketElement).toBeInTheDocument();
});
