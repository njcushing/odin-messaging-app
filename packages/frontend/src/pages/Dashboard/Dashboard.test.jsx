/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import Dashboard from './index.jsx'

import * as getSelf from "@/utils/getSelf.js";

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

const renderComponent = async (
    defaultOption = "friends",
) => {
    act(() => render(<Dashboard
        defaultOption={defaultOption}
    />));
}

vi.mock('@/features/OptionsSidebar', () => ({ 
    default: ({
        onOptionSelect,
    }) => {
        return (<div aria-label="options-sidebar"></div>);
    }
}));

vi.mock('@/features/FriendsPanel', () => ({ 
    default: () => {
        return (<div aria-label="friends-panel"></div>);
    }
}));

vi.mock('@/features/ChatsPanel', () => ({ 
    default: () => {
        return (<div aria-label="chats-panel"></div>);
    }
}));

const accountInformationOnUpdateHandler = vi.fn(() => {});
vi.mock('@/features/AccountInformation', () => ({ 
    default: ({
        onUpdateHandler={accountInformationOnUpdateHandler},
    }) => {
        return (
            <div
                aria-label="account-information"
                onClick={(e) => onUpdateHandler()}
                tabIndex={0}
            ></div>
        );
    }
}));

const settingsOnUpdateHandler = vi.fn(() => {});
vi.mock('@/features/Settings', () => ({ 
    default: ({
        onUpdateHandler={settingsOnUpdateHandler},
    }) => {
        return (
            <div
                aria-label="settings"
                onClick={(e) => onUpdateHandler()}
                tabIndex={0}
            ></div>
        );
    }
}));

const getSelfMock = vi.fn(() => ({
    status: 200,
    message: "Successfully requested currently logged-in user's data",
    user: {
        preferences: {}
    }
}));
vi.mock('@/utils/getSelf', async () => ({
    default: () => getSelfMock(),
}));

describe("UI/DOM Testing...", () => {
    describe("On mount...", () => {
        test(`The 'getSelf' API function should be invoked`, async () => {
            const getSelfSpy = vi.spyOn(getSelf, "default");
            await act(async () => { await renderComponent(); });
            expect(getSelfSpy).toHaveBeenCalled();
        });
    });
    describe("The 'defaultOption' prop...", () => {
        test(`When set to 'friends', should render the FriendsPanel component`, async () => {
            await act(async () => { await renderComponent("friends"); });
            await waitFor(() => {
                const friendsPanel = screen.getByRole("generic", { name: "friends-panel" });
                expect(friendsPanel).toBeInTheDocument();
            });
        });
        test(`When set to 'chats', should render the ChatsPanel component`, async () => {
            await act(async () => { await renderComponent("chats"); });
            await waitFor(() => {
                const chatsPanel = screen.getByRole("generic", { name: "chats-panel" });
                expect(chatsPanel).toBeInTheDocument();
            });
        });
        test(`When set to 'account', should render the AccountInformation component`, async () => {
            await act(async () => { await renderComponent("account"); });
            await waitFor(() => {
                const accountInformation = screen.getByRole("generic", { name: "account-information" });
                expect(accountInformation).toBeInTheDocument();
            });
        });
        test(`When set to 'settings', should render the Settings component`, async () => {
            await act(async () => { await renderComponent("settings"); });
            await waitFor(() => {
                const settings = screen.getByRole("generic", { name: "settings" });
                expect(settings).toBeInTheDocument();
            });
        });
    });
    describe(`If the 'onUpdateHandler' callback function passed to the
       AccountInformation component as a prop is invoked...`, () => {
        test(`The 'getSelf' API function should be invoked`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent("account"); });

            const getSelfSpy = vi.spyOn(getSelf, "default");

            const accountInformation = screen.getByRole("generic", { name: "account-information" });
            await user.click(accountInformation);

            expect(getSelfSpy).toHaveBeenCalledTimes(1);
        });
    });
    describe(`If the 'onUpdateHandler' callback function passed to the Settings
       component as a prop is invoked...`, () => {
        test(`The 'getSelf' API function should be invoked`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent("settings"); });

            const getSelfSpy = vi.spyOn(getSelf, "default");

            const settings = screen.getByRole("generic", { name: "settings" });
            await user.click(settings);

            expect(getSelfSpy).toHaveBeenCalledTimes(1);
        });
    });
});
