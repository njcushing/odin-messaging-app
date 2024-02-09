/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom";
import OptionButton from './index.jsx'

const renderComponent = (
    text = "Button",
    tooltipText = "tooltip",
    tooltipPosition = "bottom",
    widthPx = 50,
    heightPx = 50,
    fontSizePx = 30,
    borderType = "rectangular",
    onClickHandler = () => {},
) => {
    render(<OptionButton
        text={text}
        tooltipText={tooltipText}
        tooltipPosition={tooltipPosition}
        widthPx={widthPx}
        heightPx={heightPx}
        fontSizePx={fontSizePx}
        borderType={borderType}
        onClickHandler={onClickHandler}
    />);
}

vi.mock('@/features/NavBar/components/Tooltip', () => ({ 
    default: ({
        text,
        position,
        pixelBuffer,
    }) => {
        return (<></>);
    }
}));

describe("UI/DOM Testing...", () => {
    describe("The button element...", () => {
        test(`Should have the same textContent as the provided 'text' prop's
         value`, () => {
            renderComponent();
            const button = screen.getByRole("listitem", "option-button");
            expect(button.textContent).toBe("Button");
        });
        test(`When clicked, should invoke the provided 'onClickHandler' prop
         callback function`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            
            render(<OptionButton
                text="Button"
                tooltipText="tooltip"
                tooltipPosition="bottom"
                onClickHandler={callback}
            />);
            const button = screen.getByRole("button", "option-button");

            fireEvent.mouseLeave(button);
            await user.click(button);

            expect(callback).toHaveBeenCalled();
        });
    });
});