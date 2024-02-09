/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import Settings from './index.jsx'

import * as validateUserFields from '../../../../../utils/validateUserFields.js'
import * as updateUserFields from '../../utils/updateUserFields.js'

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

const renderComponent = async (
    userSettings = {
        theme: "default",
    }
) => {
    act(() => render(<Settings
        userSettings={userSettings}
    />));
}

vi.mock('@/components/FieldUpdater', () => ({ 
    default: ({
        labelText,
        fieldName,
        initialValue,
        validator,
        apiFunction,
        context,
        onUpdateHandler,
    }) => {
        return (<></>);
    }
}));

const validateTheme = vi.fn(() => ({
    status: true,
    message: "Valid Theme.",
}));
vi.mock('../../../../../utils/validateUserFields', async () => {
    const actual = await vi.importActual("../../../../../utils/validateUserFields");
    return {
        ...actual,
        theme: () => validateTheme(),
    }
});

const updateTheme = vi.fn(() => ({
    status: true,
    message: "Display Name successfully updated.",
}));
vi.mock('./utils/updateUserFields', async () => {
    const actual = await vi.importActual("./utils/updateUserFields");
    return {
        ...actual,
        theme: () => updateTheme(),
    }
});

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the title...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const title = screen.getByRole("heading", { name: "settings-panel" });
            expect(title).toBeInTheDocument();
        });
    });
});