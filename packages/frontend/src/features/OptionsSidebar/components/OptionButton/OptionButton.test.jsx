/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom";
import OptionButton from './index.jsx'

const renderComponent = () => {
    render(<OptionButton
        text="Button"
        onClickHandler={() => {}}
    />);
}

describe("UI/DOM Testing...", () => {
    describe("The button element...", () => {
        test(`Should have the same textContent as the provided 'text' prop's
         value`, () => {
            renderComponent();
            const button = screen.getByRole("button", { name: /Button/i });
            expect(button).toBeInTheDocument();
        });
        test(`When clicked, should invoke the provided 'onClickHandler' prop
         callback function`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            
            render(<OptionButton
                text="Button"
                onClickHandler={callback}
            />);
            const button = screen.getByRole("button", { name: /Button/i });

            await user.click(button);

            expect(callback).toHaveBeenCalled();
        });
    });
});