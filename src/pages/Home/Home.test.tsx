import {
    render,
    screen
} from '@testing-library/react';

import Home from './Home';

test('renders Home() React function instance', () => {
    render(<Home />);
    const homeElement = screen.getByTestId('home');
    expect(homeElement).toBeInTheDocument();
});