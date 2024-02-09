/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import ErrorPage from './index.jsx'

const renderComponent = () => {
    render(<ErrorPage />);
}

vi.mock('@/features/NavBar/components/NavigationButton', () => ({ 
    default: ({
        text,
        onClickHandler,
        link,
    }) => {
        return (<></>);
    }
}));

describe("UI/DOM Testing...", () => {
    describe("The error message element...", () => {
        test("Should exist on the page", () => {
            renderComponent();
            const errorMessage = screen.getByRole("heading", { name: "error-message" });
            expect(errorMessage).toBeInTheDocument();
        });
    });
});
