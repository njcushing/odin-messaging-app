/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import Friend from './index.jsx'

const renderComponent = (
    username = "Test Name",
    tagLine = "Test tag line",
    status = "online",
    imageSrc = "image_src",
    imageAlt = "image alt",
    onClickHandler = () => {},
) => {
    render(<Friend
        username={username}
        tagLine={tagLine}
        status={status}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        onClickHandler={onClickHandler}
    />);
}

vi.mock('@/components/ProfileImage', () => ({ 
    default: ({
        src,
        alt,
        sizePx,
    }) => {
        return (<div aria-label="profile-image"></div>);
    }
}));

describe("UI/DOM Testing...", () => {
    describe("The container element...", () => {
        test(`Should be present in the document`, () => {
            renderComponent();
            const container = screen.getByRole("generic", { name: "chat-option" });
            expect(container).toBeInTheDocument();
        });
        test(`When clicked, should invoke the provided callback function`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            
            renderComponent(
                "Test Name",
                "Test tag line",
                "online",
                "image_src",
                "image alt",
                callback,
            );
            const container = screen.getByRole("generic", { name: "chat-option" });

            await user.click(container);
            fireEvent.mouseLeave(container);

            expect(callback).toHaveBeenCalled();
        });
    });
    describe("The element displaying the name...", () => {
        test(`Should have the same textContent as the provided 'username' prop's
            value`, () => {
            renderComponent();
            const name = screen.getByRole("heading", { name: "display-name" });
            expect(name).toBeInTheDocument();
            expect(name.textContent).toBe("Test Name");
        });
    });
    describe("The element displaying the tag line...", () => {
        test(`Should not be present in the document if the provided 'tagLine'
         prop's value is of length 0`, () => {
            renderComponent(
                "Test Name",
                "",
                "online",
                "image_src",
                "image alt",
                () => {},
            );
            const tagLine = screen.queryByRole("heading", { name: "tag-line" });
            expect(tagLine).toBeNull();
        });
        test(`Should have the same textContent as the provided 'tagLine' prop's
         value`, () => {
            renderComponent();
            const tagLine = screen.getByRole("heading", { name: "tag-line" });
            expect(tagLine).toBeInTheDocument();
            expect(tagLine.textContent).toBe("Test tag line");
        });
    });
});