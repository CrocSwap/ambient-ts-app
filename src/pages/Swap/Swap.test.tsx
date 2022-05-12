import { render, screen } from '@testing-library/react';

import Swap from './Swap';

test('renders Swap() React function instance', () => {
    render(<Swap />);
    const swapElement = screen.getByTestId('swap');
    expect(swapElement).toBeInTheDocument();
});
