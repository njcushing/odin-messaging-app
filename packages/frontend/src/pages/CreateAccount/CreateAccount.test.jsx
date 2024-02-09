/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import CreateAccount from './index.jsx'

import * as createAccountAPI from './utils/createAccountAPI.js'
import * as validateFields from './utils/validateFields.js'

const renderComponent = async () => {
    act(() => render(<CreateAccount />));
}

const createAccountAPIMock = vi.fn(() => ({
    status: 200,
    message: "Log in attempt successful",
}));
vi.mock('./utils/createAccountAPI', async () => ({
    default: () => createAccountAPIMock(),
}));

const validateUsername = vi.fn(() => ({
    status: true,
    message: "Valid Username.",
}));
const validatePassword = vi.fn(() => ({
    status: true,
    message: "Valid Password.",
}));
vi.mock('./utils/validateFields', async () => {
    const actual = await vi.importActual("./utils/validateFields");
    return {
        ...actual,
        validateUsername: () => validateUsername(),
        validatePassword: () => validatePassword(),
    }
});

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the title...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const createAccountTitle = screen.getByRole("heading", { name: "create-account-panel" });
            expect(createAccountTitle).toBeInTheDocument();
        });
    });
    describe("The heading element displaying the requirement message...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const requirementMessage = screen.getByRole("heading", { name: "requirement-message" });
            expect(requirementMessage).toBeInTheDocument();
        });
    });
    describe("The label element for the 'Username' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const usernameLabel = screen.getByLabelText("Username*:");
            expect(usernameLabel).toBeInTheDocument();
        });
    });
    describe("The 'Username' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const usernameInput = screen.getByRole("textbox", { name: "username-input" });
            expect(usernameInput).toBeInTheDocument();
        });
        test(`On change, should invoke the validateUsername function`, async () => {
            const user = userEvent.setup();
            const validateUsernameSpy = vi.spyOn(validateFields, "validateUsername");
            await renderComponent();
            const usernameInput = screen.getByRole("textbox", { name: "username-input" });
            await user.type(usernameInput, "a");
            expect(validateUsernameSpy).toHaveBeenCalledTimes(1);
        });
    });
    describe("The 'Username' error message...", () => {
        test(`Should not be present in the document by default`, async () => {
            await renderComponent();
            const usernameError = screen.queryByRole("heading", { name: "username-error" });
            expect(usernameError).toBeNull();
        });
        test(`Should be present if the value of the 'Username' input is changed
         and the new value is invalid`, async () => {
            const user = userEvent.setup();
            validateUsername.mockReturnValueOnce({
                status: false,
                message: "Invalid Username.",
            });
            await renderComponent();

            const usernameInput = screen.getByRole("textbox", { name: "username-input" });
            await user.type(usernameInput, "a");
            const usernameError = screen.getByRole("heading", { name: "username-error" });
            expect(usernameError).toBeInTheDocument();
        });
    });
    describe("The label element for the 'Password' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const passwordLabel = screen.getByLabelText("Password*:");
            expect(passwordLabel).toBeInTheDocument();
        });
    });
    describe("The 'Password' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const passwordInput = screen.getByLabelText("password-input");
            expect(passwordInput).toBeInTheDocument();
        });
        test(`On change, should invoke the validatePassword function`, async () => {
            const user = userEvent.setup();
            const validatePasswordSpy = vi.spyOn(validateFields, "validatePassword");
            await renderComponent();
            const passwordInput = screen.getByLabelText("password-input");
            await user.type(passwordInput, "a");
            expect(validatePasswordSpy).toHaveBeenCalled();
        });
    });
    describe("The 'Password' error message...", () => {
        test(`Should not be present in the document by default`, async () => {
            await renderComponent();
            const passwordError = screen.queryByRole("heading", { name: "password-error" });
            expect(passwordError).toBeNull();
        });
        test(`Should be present if the value of the 'Password' input is changed
         and the new value is invalid`, async () => {
            const user = userEvent.setup();
            validatePassword.mockReturnValueOnce({
                status: false,
                message: "Invalid Password.",
            });
            await renderComponent();

            const passwordInput = screen.getByLabelText("password-input");
            await user.type(passwordInput, "a");
            const passwordError = screen.getByRole("heading", { name: "password-error" });
            expect(passwordError).toBeInTheDocument();
        });
        test(`Should be present if the value of the 'Password' input is changed
         and the new value is valid, but not equal to the value of the 'Confirm
         Password' input`, async () => {
            const user = userEvent.setup();
            validatePassword.mockReturnValueOnce({
                status: true,
                message: "Valid Password.",
            });
            await renderComponent();

            const passwordInput = screen.getByLabelText("password-input");
            const confirmPasswordInput = screen.getByLabelText("confirm-password-input");
            await user.type(passwordInput, "a");
            await user.type(confirmPasswordInput, "b");
            const passwordError = screen.getByRole("heading", { name: "password-error" });
            expect(passwordError).toBeInTheDocument();
        });
    });
    describe("The label element for the 'Confirm Password' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const confirmPasswordLabel = screen.getByLabelText("Confirm Password*:");
            expect(confirmPasswordLabel).toBeInTheDocument();
        });
    });
    describe("The 'Confirm Password' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const confirmPasswordInput = screen.getByLabelText("confirm-password-input");
            expect(confirmPasswordInput).toBeInTheDocument();
        });
        test(`On change, should invoke the validatePassword function`, async () => {
            const user = userEvent.setup();
            const validatePasswordSpy = vi.spyOn(validateFields, "validatePassword");
            await renderComponent();
            const confirmPasswordInput = screen.getByLabelText("confirm-password-input");
            await user.type(confirmPasswordInput, "a");
            expect(validatePasswordSpy).toHaveBeenCalled();
        });
    });
    describe("The 'Confirm Password' error message...", () => {
        test(`Should not be present in the document by default`, async () => {
            await renderComponent();
            const confirmPasswordError = screen.queryByRole("heading", { name: "confirm-password-error" });
            expect(confirmPasswordError).toBeNull();
        });
        test(`Should be present if the value of the 'Password' input is changed
         and the new value is invalid`, async () => {
            const user = userEvent.setup();
            /*
                Have to mock twice because 'Confirm Password' field is validated
                after 'Password' field
            */
            validatePassword.mockReturnValueOnce({
                status: false,
                message: "Invalid Password.",
            });
            validatePassword.mockReturnValueOnce({
                status: false,
                message: "Invalid Password.",
            });
            await renderComponent();

            const confirmPasswordInput = screen.getByLabelText("confirm-password-input");
            await user.type(confirmPasswordInput, "a");
            const confirmPasswordError = screen.getByRole("heading", { name: "confirm-password-error" });
            expect(confirmPasswordError).toBeInTheDocument();
        });
        test(`Should be present if the value of the 'Password' input is changed
         and the new value is valid, but not equal to the value of the 'Confirm
         Password' input`, async () => {
            const user = userEvent.setup();
            validatePassword.mockReturnValueOnce({
                status: true,
                message: "Valid Password.",
            });
            await renderComponent();

            const confirmPasswordInput = screen.getByLabelText("confirm-password-input");
            const passwordInput = screen.getByLabelText("password-input");
            await user.type(confirmPasswordInput, "a");
            await user.type(passwordInput, "b");
            const confirmPasswordError = screen.getByRole("heading", { name: "confirm-password-error" });
            expect(confirmPasswordError).toBeInTheDocument();
        });
    });
    describe("The 'Create Account' button...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const createAccountButton = screen.getByRole("button", { name: "create-account-button" });
            expect(createAccountButton).toBeInTheDocument();
        });
        test(`When clicked, should not invoke the 'createAccountAPI' function if
         any of the 'Username', 'Password' or 'Confirm Password' fields are
         invalid`, async () => {
            const user = userEvent.setup();
            const createAccountAPISpy = vi.spyOn(createAccountAPI, "default");
            validateUsername.mockReturnValueOnce({
                status: false,
                message: "Invalid Username",
            });
            await renderComponent();

            const createAccountButton = screen.getByRole("button", { name: "create-account-button" });
            await user.click(createAccountButton);
            expect(createAccountAPISpy).toHaveBeenCalledTimes(0);
        });
        test(`When clicked, should invoke the 'createAccountAPI' function if all
         form fields are valid`, async () => {
            const user = userEvent.setup();
            const createAccountAPISpy = vi.spyOn(createAccountAPI, "default");
            await renderComponent();

            const createAccountButton = screen.getByRole("button", { name: "create-account-button" });
            await user.click(createAccountButton);
            expect(createAccountAPISpy).toHaveBeenCalledTimes(1);
        });
    });
    describe("The create account error...", () => {
        test(`Should not be present in the document by default`, async () => {
            renderComponent();
            const createAccountError = screen.queryByRole("heading", { name: "create-account-error" });
            expect(createAccountError).toBeNull();
        });
        test(`Should be present in the document if a create account attempt has
         failed`, async () => {
            const user = userEvent.setup();
            createAccountAPIMock.mockReturnValueOnce({
                status: 400,
                message: "Create account attempt failed."
            });
            await renderComponent();

            const createAccountButton = screen.getByRole("button", { name: "create-account-button" });
            await user.click(createAccountButton);
            
            const createAccountError = screen.getByRole("heading", { name: "create-account-error" });
            expect(createAccountError).toBeInTheDocument();
        });
    });
    describe("The 'Return to Log In' button...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const returnToLogInButton = screen.getByRole("button", { name: "return-to-log-in" });
            expect(returnToLogInButton).toBeInTheDocument();
        });
    });
});