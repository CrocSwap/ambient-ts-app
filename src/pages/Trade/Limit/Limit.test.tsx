import { render, screen } from '@testing-library/react';

import Limit from './Limit';

test('renders Market() React function instance', () => {
    render(<Limit />);
    const limitElement = screen.getByTestId('limit');
    expect(limitElement).toBeInTheDocument();
});
