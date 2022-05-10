import { render, screen } from '@testing-library/react';

import Liquidity from './Liquidity';

test('renders Market() React function instance', () => {
    render(<Liquidity />);
    const liquidityElement = screen.getByTestId('liquidity');
    expect(liquidityElement).toBeInTheDocument();
});
