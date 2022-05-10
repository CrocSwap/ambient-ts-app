import {
    render,
    screen
} from '@testing-library/react';

import PageFooter from './PageFooter';

test('renders PageFooter() React function instance', () => {
    render(<PageFooter />);
    const pageFooterElement = screen.getByTestId('page-footer');
    expect(pageFooterElement).toBeInTheDocument();
});