/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import Message from './index.jsx'

const renderComponent = (
    text = "Sample Text",
    name = "My Name",
    dateSent = "2023-01-01T00:00:00",
    imageSrc = "image_src",
    imageAlt = "image alt",
    position = "right",
    onReplyToHandler = () => {},
) => {
    render(<Message
        text={text}
        name={name}
        dateSent={dateSent}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        position={position}
        onReplyToHandler={onReplyToHandler}
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
    describe("The <p> element displaying the message author name and date...", () => {
        test(`Should be present in the document`, () => {
            renderComponent();
            const nameAndDate = screen.getByText("My Name at 01/01/2023, 00:00:00");
            expect(nameAndDate).toBeInTheDocument();
        });
    });
});