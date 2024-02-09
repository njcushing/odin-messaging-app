/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom";
import NavigationButton from './index.jsx'

describe("UI/DOM Testing...", () => {
    describe("The button (Link) element...", () => {
        test(`Should have the same textContent as the provided 'text' prop's
         value`, () => {
            render(<BrowserRouter><NavigationButton text="Example" /></BrowserRouter>);
            const button = screen.getByRole("link", { name: /Example/i });
            expect(button).toBeInTheDocument();
        });
        test(`When clicked, should invoke the provided callback function`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            
            render(<BrowserRouter><NavigationButton text="Example" onClickHandler={callback} /></BrowserRouter>);
            const button = screen.getByRole("link", { name: /Example/i });

            await user.click(button);

            expect(callback).toHaveBeenCalled();
        });
    });
});