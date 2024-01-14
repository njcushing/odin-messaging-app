/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ProfileImage from './index.jsx'

const renderComponent = (
    src = "image_src",
    alt = "image alt",
    status = null,
    sizePx = 50,
) => {
    render(<ProfileImage
        src={src}
        alt={alt}
        status={status}
        sizePx={sizePx}
    />);
}

describe("UI/DOM Testing...", () => {
    describe("The <img> element...", () => {
        test(`Should have a 'alt' attribute with a value equal to the provided
         'imageAlt' prop's value`, () => {
            renderComponent();
            const image = screen.getByRole("img", { name: "profile-image" });
            expect(image).toBeInTheDocument();
            expect(image.alt).toBe("image alt");
        });
    });
    describe("The status indicator...", () => {
        test(`Should be present in the document if the value provided to the
         'status' prop is not equal to 'null'`, () => {
            renderComponent("image_src", "image alt", "online", 50);
            const statusIndicator = screen.getByRole("generic", { name: "status-indicator" });
            expect(statusIndicator).toBeInTheDocument();
        });
        test(`Should not be present in the document if the value provided to the
         'status' prop is equal to 'null'`, () => {
            renderComponent();
            const statusIndicator = screen.queryByRole("generic", { name: "status-indicator" });
            expect(statusIndicator).toBeNull();
        });
    });
});