/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import Dashboard from './index.jsx'

const renderComponent = () => {
    render(<Dashboard />);
}

describe("UI/DOM Testing...", () => {
    describe("The title element...", () => {
        test("Should exist on the page", () => {
            renderComponent();
            const title = screen.getByRole("heading", { name: "title" });
            expect(title).toBeInTheDocument();
        });
    });
});
