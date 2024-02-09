/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import LogIn from './index.jsx'

import * as logInAPI from './utils/logInAPI.js'
import * as validateFields from './utils/validateFields.js'

const renderComponent = async () => {
    act(() => render(<LogIn />));
}

const logInAPIMock = vi.fn(() => ({
    status: 200,
    message: "Log in attempt successful",
}));
vi.mock('./utils/logIn', async () => ({
    default: () => logInAPIMock(),
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
            const logInTitle = screen.getByRole("heading", { name: "log-in-panel" });
            expect(logInTitle).toBeInTheDocument();
        });
    });
    describe("The label element for the 'Username' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const usernameLabel = screen.getByLabelText("Username:");
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
            })
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
            const passwordLabel = screen.getByLabelText("Password:");
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
            expect(validatePasswordSpy).toHaveBeenCalledTimes(1);
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
            })
            await renderComponent();

            const passwordInput = screen.getByLabelText("password-input");
            await user.type(passwordInput, "a");
            const passwordError = screen.getByRole("heading", { name: "password-error" });
            expect(passwordError).toBeInTheDocument();
        });
    });
    describe("The 'Log In' button...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const logInButton = screen.getByRole("button", { name: "log-in-button" });
            expect(logInButton).toBeInTheDocument();
        });
        test(`When clicked, should not invoke the 'logIn' API function if the
         Username and/or Password fields are invalid`, async () => {
            const user = userEvent.setup();
            const logInAPISpy = vi.spyOn(logInAPI, "default");
            validateUsername.mockReturnValueOnce({
                status: false,
                message: "Invalid Username",
            })
            await renderComponent();

            const logInButton = screen.getByRole("button", { name: "log-in-button" });
            await user.click(logInButton);
            expect(logInAPISpy).toHaveBeenCalledTimes(0);
        });
        test(`When clicked, should invoke the 'logIn' API function if both the
         Username and Password fields are valid`, async () => {
            const user = userEvent.setup();
            const logInAPISpy = vi.spyOn(logInAPI, "default");
            await renderComponent();

            const logInButton = screen.getByRole("button", { name: "log-in-button" });
            await user.click(logInButton);
            expect(logInAPISpy).toHaveBeenCalledTimes(1);
        });
    });
    describe("The 'Create Account' message...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const createAccountMessage = screen.getByRole("heading", { name: "create-account-message" });
            expect(createAccountMessage).toBeInTheDocument();
        });
    });
    describe("The 'Create Account' button...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const createAccountButton = screen.getByRole("button", { name: "create-account-button" });
            expect(createAccountButton).toBeInTheDocument();
        });
    });
    describe("The log in error...", () => {
        test(`Should not be present in the document by default`, async () => {
            renderComponent();
            const logInError = screen.queryByRole("heading", { name: "log-in-error" });
            expect(logInError).toBeNull();
        });
        test(`Should be present in the document if a log in attempt has failed`, async () => {
            const user = userEvent.setup();
            logInAPIMock.mockReturnValueOnce({
                status: 400,
                message: "Log in attempt failed."
            })
            await renderComponent();

            const logInButton = screen.getByRole("button", { name: "log-in-button" });
            await user.click(logInButton);
            
            const logInError = screen.getByRole("heading", { name: "log-in-error" });
            expect(logInError).toBeInTheDocument();
        });
    });
});