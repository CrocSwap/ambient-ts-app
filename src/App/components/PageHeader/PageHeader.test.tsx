import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../test-utils';

import PageHeader from './PageHeader';

test('renders PageHeader() React function instance', () => {
  renderWithRouter(<PageHeader />);
  const pageHeaderElement = screen.getByTestId('page-header');
  expect(pageHeaderElement).toBeInTheDocument();
});
