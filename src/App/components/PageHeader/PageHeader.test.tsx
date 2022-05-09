import { render, screen } from '@testing-library/react';

import { BrowserRouter as Router } from 'react-router-dom';

import PageHeader from './PageHeader';

test('renders PageHeader() React function instance', () => {
  render(
    <Router>
      <PageHeader />
    </Router>,
  );
  const pageHeaderElement = screen.getByTestId('page-header');
  expect(pageHeaderElement).toBeInTheDocument();
});
