/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import CreateAccount from './index.jsx'

import * as createAccountAPI from './utils/createAccountAPI.js'
import * as validateUserFields from '../../../../../utils/validateUserFields.js'
import * as redirectUserToLogin from '@/utils/redirectUserToLogin.js'

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

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

const username = vi.fn(() => ({
    status: true,
    message: "Valid Username.",
}));
const email = vi.fn(() => ({
    status: true,
    message: "Valid Email.",
}));
const password = vi.fn(() => ({
    status: true,
    message: "Valid Password.",
}));
vi.mock('../../../../../utils/validateUserFields', async () => {
    const actual = await vi.importActual("../../../../../utils/validateUserFields");
    return {
        ...actual,
        username: () => username(),
        email: () => email(),
        password: () => password(),
    }
});

const redirectUserToLoginMock = vi.fn(() => {});
vi.mock("@/utils/redirectUserToLogin.js", async () => ({
    default: () => redirectUserToLoginMock(),
}));

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
        test(`On change, should invoke the username function`, async () => {
            const user = userEvent.setup();
            const usernameSpy = vi.spyOn(validateUserFields, "username");
            await renderComponent();
            const usernameInput = screen.getByRole("textbox", { name: "username-input" });
            await user.type(usernameInput, "a");
            expect(usernameSpy).toHaveBeenCalledTimes(1);
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
            username.mockReturnValueOnce({
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
    describe("The 'Email' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const emailInput = screen.getByRole("textbox", { name: "email-input" });
            expect(emailInput).toBeInTheDocument();
        });
        test(`On change, should invoke the email function`, async () => {
            const user = userEvent.setup();
            const emailSpy = vi.spyOn(validateUserFields, "email");
            await renderComponent();
            const emailInput = screen.getByRole("textbox", { name: "email-input" });
            await user.type(emailInput, "a");
            expect(emailSpy).toHaveBeenCalledTimes(1);
        });
    });
    describe("The 'Email' error message...", () => {
        test(`Should not be present in the document by default`, async () => {
            await renderComponent();
            const emailError = screen.queryByRole("heading", { name: "email-error" });
            expect(emailError).toBeNull();
        });
        test(`Should be present if the value of the 'Email' input is changed and
         the new value is invalid`, async () => {
            const user = userEvent.setup();
            email.mockReturnValueOnce({
                status: false,
                message: "Invalid Email.",
            });
            await renderComponent();

            const emailInput = screen.getByRole("textbox", { name: "email-input" });
            await user.type(emailInput, "a");
            const emailError = screen.getByRole("heading", { name: "email-error" });
            expect(emailError).toBeInTheDocument();
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
        test(`On change, should invoke the password function`, async () => {
            const user = userEvent.setup();
            const passwordSpy = vi.spyOn(validateUserFields, "password");
            await renderComponent();
            const passwordInput = screen.getByLabelText("password-input");
            await user.type(passwordInput, "a");
            expect(passwordSpy).toHaveBeenCalled();
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
            password.mockReturnValueOnce({
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
            password.mockReturnValueOnce({
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
        test(`On change, should invoke the password function`, async () => {
            const user = userEvent.setup();
            const passwordSpy = vi.spyOn(validateUserFields, "password");
            await renderComponent();
            const confirmPasswordInput = screen.getByLabelText("confirm-password-input");
            await user.type(confirmPasswordInput, "a");
            expect(passwordSpy).toHaveBeenCalled();
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
            password.mockReturnValueOnce({
                status: false,
                message: "Invalid Password.",
            });
            password.mockReturnValueOnce({
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
            password.mockReturnValueOnce({
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
         any of the 'Username', 'Email', 'Password' or 'Confirm Password' fields
         are invalid`, async () => {
            const user = userEvent.setup();
            const createAccountAPISpy = vi.spyOn(createAccountAPI, "default");
            username.mockReturnValueOnce({
                status: false,
                message: "Invalid Username",
            });
            email.mockReturnValueOnce({
                status: false,
                message: "Invalid Email",
            });
            password.mockReturnValueOnce({
                status: false,
                message: "Invalid Password",
            }).mockReturnValueOnce({
                status: false,
                message: "Invalid Confirm Password",
            });
            await renderComponent();

            const createAccountButton = screen.getByRole("button", { name: "create-account-button" });
            await user.click(createAccountButton);
            fireEvent.mouseLeave(createAccountButton);
            expect(createAccountAPISpy).toHaveBeenCalledTimes(0);
        });
        test(`When clicked, should not invoke the 'createAccountAPI' function if
         all fields are valid but the 'Password' and 'Confirm Password' fields
         do not match`, async () => {
            const user = userEvent.setup();
            const createAccountAPISpy = vi.spyOn(createAccountAPI, "default");
            await renderComponent();

            const passwordInput = screen.getByLabelText("password-input");
            await user.type(passwordInput, "a");

            const confirmPasswordInput = screen.getByLabelText("confirm-password-input");
            await user.type(confirmPasswordInput, "b");

            const createAccountButton = screen.getByRole("button", { name: "create-account-button" });
            await user.click(createAccountButton);
            fireEvent.mouseLeave(createAccountButton);
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
    describe("When receiving a response from the 'createAccountAPI' function...", () => {
        test(`If the response has a status of >= 400, the username and email
         used in the attempt should be retained in their inputs`, async () => {
            const user = userEvent.setup();

            createAccountAPIMock.mockReturnValueOnce({
                status: 400,
                message: "Bad data",
            });

            await renderComponent();

            const usernameInput = screen.getByRole("textbox", { name: "username-input" });
            await user.type(usernameInput, "a");

            const emailInput = screen.getByRole("textbox", { name: "email-input" });
            await user.type(emailInput, "b");

            const createAccountButton = screen.getByRole("button", { name: "create-account-button" });
            await user.click(createAccountButton);

            expect(usernameInput.value).toBe("a");
            expect(emailInput.value).toBe("b");
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
        test(`When clicked, should invoke the 'redirectUserToLogin' function`, async () => {
            const redirectUserToLoginSpy = vi.spyOn(redirectUserToLogin, "default");
            const user = userEvent.setup();
            await renderComponent();
            const returnToLogInButton = screen.getByRole("button", { name: "return-to-log-in" });
            expect(redirectUserToLoginSpy).not.toHaveBeenCalled();
            await user.click(returnToLogInButton);
            fireEvent.mouseLeave(returnToLogInButton);
            expect(redirectUserToLoginSpy).toHaveBeenCalled();
        });
    });
});