/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom";
import Tooltip from './index.jsx'

const renderComponent = () => {
    render(<Tooltip
        text="Tooltip"
        position="bottom"
        pixelBuffer={6}
    />);
}

describe("UI/DOM Testing...", () => {
    describe("The text element...", () => {
        test(`Should have the same textContent as the provided 'text' prop's
         value`, () => {
            renderComponent();
            const tooltipText = screen.getByRole("generic", { name: "tooltip-text" });
            expect(tooltipText).toBeInTheDocument();
        });
    });
});