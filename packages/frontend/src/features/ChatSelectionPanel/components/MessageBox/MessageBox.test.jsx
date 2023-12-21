/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import MessageBox from './index.jsx'

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
    describe("The form-submission button...", () => {
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