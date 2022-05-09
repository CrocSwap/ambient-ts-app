import {
    render,
    screen
} from '@testing-library/react';

import Home from './Home';

test('renders learn react link', () => {
    render(<Home />);
    const homeElement = screen.getByTestId('home');
    expect(homeElement).toBeInTheDocument();
});