import {
    render,
    screen
} from '@testing-library/react';

import PageHeader from './PageHeader';

test('renders PageHeader() React function instance', () => {
    render(<PageHeader />);
    const pageHeaderElement = screen.getByTestId('page-header');
    expect(pageHeaderElement).toBeInTheDocument();
});