// test utils file
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

export const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);

    return {
        user: userEvent.setup(),
        ...render(ui, { wrapper: BrowserRouter }),
    };
};
