import { render, screen } from '@testing-library/react';

import Analytics from './Analytics';

test.skip('renders Analytics() React function instance', () => {
    render(<Analytics />);
    const analyticsElement = screen.getByTestId('analytics');
    expect(analyticsElement).toBeInTheDocument();
});
