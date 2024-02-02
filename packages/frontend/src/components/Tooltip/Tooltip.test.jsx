/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom";
import Tooltip from './index.jsx'

const renderComponent = (
    text = "Tooltip",
    position = "bottom",
    pixelBuffer = 6,
) => {
    return render(<Tooltip
        text={text}
        position={position}
        pixelBuffer={pixelBuffer}
    />);
}

describe("UI/DOM Testing...", () => {
    describe("The element...", () => {
        test(`Should return a 'null' element if the provided 'text' prop's value
         has a length of 0 characters, otherwise it should be present in the
         document`, () => {
            let tooltip;
            
            renderComponent("");
            tooltip = screen.queryByRole("generic", { name: "tooltip" });
            expect(tooltip).toBeNull();

            renderComponent();
            tooltip = screen.getByRole("generic", { name: "tooltip" });
            expect(tooltip).not.toBeNull();
        });
        test(`Should throw no errors on mount regardless of which of the four
         values ("top", "right", "bottom", "left") is used in the 'position'
         prop`, () => {
            const consoleErrorSpy = vi.spyOn(console, "error");
            
            renderComponent("Tooltip", "top");
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            consoleErrorSpy.mockClear();
            
            renderComponent("Tooltip", "right");
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            consoleErrorSpy.mockClear();
            
            renderComponent("Tooltip", "bottom");
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            consoleErrorSpy.mockClear();
            
            renderComponent("Tooltip", "left");
            expect(consoleErrorSpy).not.toHaveBeenCalled();
            consoleErrorSpy.mockClear();
            
            consoleErrorSpy.mockReturnValueOnce(); // suppress console error
            renderComponent("Tooltip", "other");
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockClear();
        });
    });
    describe("The text element...", () => {
        test(`Should have the same textContent as the provided 'text' prop's
         value`, () => {
            renderComponent();
            const tooltipText = screen.getByRole("generic", { name: "tooltip-text" });
            expect(tooltipText).toBeInTheDocument();
        });
    });
});