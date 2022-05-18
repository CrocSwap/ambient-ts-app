import { render, screen } from '@testing-library/react';

import Range from './Range';

test('renders Market() React function instance', () => {
    render(<Range />);
    const rangeElement = screen.getByTestId('range');
    expect(rangeElement).toBeInTheDocument();
});
