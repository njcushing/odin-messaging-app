/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import MessageBox from './index.jsx'

import * as validateMessage from "../../../../../../../../../utils/validateMessageFields.js";

const renderComponent = (
    text = "Sample Text",
    placeholder = "Write something",
    submissionErrors = [],
    onSubmitHandler = () => {},
) => {
    render(<MessageBox
        text={text}
        placeholder={placeholder}
        submissionErrors={submissionErrors}
        onSubmitHandler={onSubmitHandler}
    />);
}

const validateImage = vi.fn(() => ({
    status: true,
    message: "Valid image",
}));
vi.mock('../../../../../../../../../utils/validateMessageFields.js', async () => {
    const actual = await vi.importActual("../../../../../../../../../utils/validateMessageFields.js");
    return {
        ...actual,
        image: () => validateImage(),
    }
});

describe("UI/DOM Testing...", () => {
    describe("The textarea element...", () => {
        test(`Should have the same placeholder as the provided 'placeholder'
         prop's value`, () => {
            renderComponent();
            const textbox = screen.getByRole("textbox", { name: "message-text-box" });
            expect(textbox).toBeInTheDocument();
            expect(textbox.placeholder).toBe("Write something");
        });
        test(`Should have the same textContent as the provided 'text' prop's
         value`, () => {
            renderComponent();
            const textbox = screen.getByRole("textbox", { name: "message-text-box" });
            expect(textbox).toBeInTheDocument();
            expect(textbox.textContent).toBe("Sample Text");
        });
    });
    describe("The 'Upload' button...", () => {
        test(`When a file is selected after clicking it, if an error is thrown,
         the 'validateMessageFields.image' should not be invoked`, async () => {
            const validateImageSpy = vi.spyOn(validateMessage, "image");

            const user = userEvent.setup();
            renderComponent();

            const uploadButton = screen.getByLabelText("upload-image");
            
            const file = new File(['hello'], 'hello.png', null);
            await user.upload(uploadButton, file);

            expect(validateImageSpy).not.toHaveBeenCalled();
        });
        test(`When a file is selected after clicking it, the
         'validateMessageFields.image' should be invoked`, async () => {
            const validateImageSpy = vi.spyOn(validateMessage, "image");

            const user = userEvent.setup();
            
            renderComponent();

            const uploadButton = screen.getByLabelText("upload-image");
            
            const file = new File(['hello'], 'hello.png', {type: 'image/png'});
            await user.upload(uploadButton, file);

            expect(validateImageSpy).toHaveBeenCalled();
        });
        test(`When a file is selected after clicking it, if the file passes the
         validation, the onSubmitHandler callback function should be invoked`, async () => {
            validateImage.mockReturnValueOnce({
                status: true,
                message: "Valid image",
            });

            const user = userEvent.setup();
            const callback = vi.fn();
            
            renderComponent(
                "Sample Text",
                "Write something",
                [],
                callback,
            );

            const uploadButton = screen.getByLabelText("upload-image");
            
            const file = new File(['hello'], 'hello.png', {type: 'image/png'});
            await user.upload(uploadButton, file);

            expect(callback).toHaveBeenCalled();
        });
        test(`When a file is selected after clicking it, if the file fails the
         validation, the onSubmitHandler callback function should not be invoked`, async () => {
            validateImage.mockReturnValueOnce({
                status: false,
                message: "Invalid image",
            });

            const user = userEvent.setup();
            const callback = vi.fn();
            
            renderComponent(
                "Sample Text",
                "Write something",
                [],
                callback,
            );

            const uploadButton = screen.getByLabelText("upload-image");
            
            const file = new File(['hello'], 'hello.png', {type: 'image/png'});
            await user.upload(uploadButton, file);

            expect(callback).not.toHaveBeenCalled();
        });
    });
    describe("The 'Send' button...", () => {
        test(`When clicked, should invoke the provided callback function`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            
            renderComponent(
                "Sample Text",
                "Write something",
                [],
                callback,
            );
            const submitButton = screen.getByRole("button", { name: "send-message-button" });
            
            fireEvent.mouseLeave(submitButton);
            await user.click(submitButton);

            expect(callback).toHaveBeenCalled();
        });
    });
    describe("The submission errors list title...", () => {
        test(`Should not be present in the document if there are no errors`, () => {
            renderComponent();
            const submissionErrorsList = screen.queryByRole("heading", { name: "message-submission-errors-title" });
            expect(submissionErrorsList).toBeNull();
        });
        test(`Should be present in the document if there are errors`, () => {
            renderComponent(
                "Sample Text",
                "Write something",
                ["error_1", "error_2", "error_3"],
                () => {},
            );
            const submissionErrorsList = screen.queryByRole("heading", { name: "message-submission-errors-title" });
            expect(submissionErrorsList).toBeInTheDocument();
        });
    });
    describe("The submission errors list...", () => {
        test(`Should not be present in the document if there are no errors`, () => {
            renderComponent();
            const submissionErrorsList = screen.queryByRole("list", { name: "message-submission-errors-list" });
            expect(submissionErrorsList).toBeNull();
        });
        test(`Should be present in the document if there are errors`, () => {
            renderComponent(
                "Sample Text",
                "Write something",
                ["error_1", "error_2", "error_3"],
                () => {},
            );
            const submissionErrorsList = screen.getByRole("list", { name: "message-submission-errors-list" });
            expect(submissionErrorsList).toBeInTheDocument();
        });
        test(`Should have a number of list item children equivalent to the
         number of errors`, () => {
            renderComponent(
                "Sample Text",
                "Write something",
                ["error_1", "error_2", "error_3"],
                () => {},
            );
            const submissionErrorsList = screen.getAllByRole("listitem", { name: "message-submission-error-item" });
            expect(submissionErrorsList.length).toBe(3);
        });
    });
});