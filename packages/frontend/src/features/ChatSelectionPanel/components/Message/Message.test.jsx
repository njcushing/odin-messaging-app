/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import Message from './index.jsx'

const renderComponent = (
    text = "Sample Text",
    imageSrc = "image_src",
    imageAlt = "image alt",
    position = "right",
) => {
    render(<Message
        text={text}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        position={position}
    />);
}

vi.mock('@/components/ProfileImage', () => ({ 
    default: ({
        src,
        alt,
        sizePx,
    }) => {
        return (<></>);
    }
}));

describe("UI/DOM Testing...", () => {
    describe("The <p> element displaying the message text...", () => {
        test(`Should have the same textContent as the provided 'text' prop's
         value`, () => {
            renderComponent();
            const messageText = screen.getByText("Sample Text");
            expect(messageText).toBeInTheDocument();
        });
    });
});