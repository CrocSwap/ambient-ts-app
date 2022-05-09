import { render, screen } from '@testing-library/react';

import Trade from './Trade';

test('renders Trade() React function instance', () => {
  render(<Trade />);
  const tradeElement = screen.getByTestId('trade');
  expect(tradeElement).toBeInTheDocument();
});
