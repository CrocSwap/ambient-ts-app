import { render, screen } from '@testing-library/react';

import Chart from './Chart';

test('renders Chart() React function instance', () => {
    render(<Chart />);
    const chartElement = screen.getByTestId('chart');
    expect(chartElement).toBeInTheDocument();
});
