/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import AccountInformation from './index.jsx'

import * as validateUserFields from '../../../../../utils/validateUserFields.js'
import * as updateUserFields from '../../utils/updateUserFields.js'

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

const renderComponent = async (
    userInfo = {
        displayName: "Name",
        tagLine: "Tag line",
        status: "online",
    }
) => {
    act(() => render(<AccountInformation
        userInfo={userInfo}
    />));
}

const validateDisplayName = vi.fn(() => ({
    status: true,
    message: "Valid Display Name.",
}));
const validateTagLine = vi.fn(() => ({
    status: true,
    message: "Valid Tag Line.",
}));
const validateStatus = vi.fn(() => ({
    status: true,
    message: "Valid Status.",
}));
const validateProfileImage = vi.fn(() => ({
    status: true,
    message: "Valid Profile Image.",
}));
vi.mock('../../../../../utils/validateUserFields', async () => {
    const actual = await vi.importActual("../../../../../utils/validateUserFields");
    return {
        ...actual,
        displayName: () => validateDisplayName(),
        tagLine: () => validateTagLine(),
        status: () => validateStatus(),
        profileImage: () => validateProfileImage(),
    }
});

const updateDisplayName = vi.fn(() => ({
    status: true,
    message: "Display Name successfully updated.",
}));
const updateTagLine = vi.fn(() => ({
    status: true,
    message: "Tag Line successfully updated.",
}));
const updateStatus = vi.fn(() => ({
    status: true,
    message: "Status successfully updated.",
}));
const updateProfileImage = vi.fn(() => ({
    status: true,
    message: "Profile Image successfully updated.",
}));
vi.mock('./utils/updateUserFields', async () => {
    const actual = await vi.importActual("./utils/updateUserFields");
    return {
        ...actual,
        displayName: () => updateDisplayName(),
        tagLine: () => updateTagLine(),
        status: () => updateStatus(),
        profileImage: () => updateProfileImage(),
    }
});

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the title...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const title = screen.getByRole("heading", { name: "account-information-panel" });
            expect(title).toBeInTheDocument();
        });
    });
});