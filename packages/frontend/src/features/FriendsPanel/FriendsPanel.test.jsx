/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import FriendsPanel from './index.jsx'

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

const renderComponent = async (
    defaultList = "friends",
    addingFriendDefault = false,
) => {
    act(() => render(<FriendsPanel
        defaultList={defaultList}
        addingFriendDefault={addingFriendDefault}
    />));
}

vi.mock('@/components/OptionButton', () => ({ 
    default: ({
        text,
        tooltipText,
        tooltipPosition,
        widthPx,
        heightPx,
        fontSizePx,
        borderStyle,
        onClickHandler,
    }) => {
        return (<></>);
    }
}));

vi.mock('./components/Friend', () => ({
    default: ({
        username,
        tagLine,
        status,
        imageSrc,
        imageAlt,
        onClickHandler,
    }) => {
        return (<></>);
    }
}));

vi.mock('./components/FriendRequest', () => ({ 
    default: ({
        username,
        imageSrc,
        imageAlt,
        onSuccessHandler,
    }) => {
        return (<></>);
    }
}));

vi.mock('./components/AddFriendPanel', () => ({ 
    default: ({
        onCloseHandler,
        onSuccessHandler,
    }) => {
        return (<div aria-label="add-friend-panel"></div>);
    }
}));

const friendsList = [
    {
        username: "Friend 1",
        tagLine: "Friend 1 tagline",
        status: "online",
        imageSrc: "",
        imageAlt: "",
    },
    {
        username: "Friend 2",
        tagLine: "Friend 2 tagline",
        status: "away",
        imageSrc: "",
        imageAlt: "",
    },
    {
        username: "Friend 3",
        tagLine: "Friend 3 tagline",
        status: "busy",
        imageSrc: "",
        imageAlt: "",
    },
];
const getFriendsList = vi.fn(() => {
    return {
        status: 200,
        message: "Found",
        friends: friendsList,
    }
});
vi.mock('./utils/getFriendsList', async () => ({
    default: () => getFriendsList(),
}));

const friendRequests = [
    {
        username: "Friend 4",
        imageSrc: "",
        imageAlt: "",
        onSuccessHandler: () => {},
    },
    {
        username: "Friend 5",
        imageSrc: "",
        imageAlt: "",
        onSuccessHandler: () => {},
    },
    {
        username: "Friend 6",
        imageSrc: "",
        imageAlt: "",
        onSuccessHandler: () => {},
    },
];
const getFriendRequests = vi.fn(() => {
    return {
        status: 200,
        message: "Found",
        friendRequests: friendRequests,
    }
});
vi.mock('./utils/getFriendRequests', async () => ({
    default: () => getFriendRequests(),
}));

describe("UI/DOM Testing...", () => {
    describe("The friends panel...", () => {
        test(`Should contain a heading element for the title`, async () => {
            await act(async () => { await renderComponent() });
            const friendsPanelTitle = screen.getByRole("heading", { name: "friends-panel-title" });
            expect(friendsPanelTitle).toBeInTheDocument();
        });
    });
    describe("The 'Add Friend' button...", () => {
        test(`Should be present in the document`, async () => {
            await act(async () => { await renderComponent() });
            const addFriendButton = screen.getByRole("listitem", { name: "add-friend-button" });
            expect(addFriendButton).toBeInTheDocument();
        });
    });
    describe("The 'View Friend Requests'/'View Friends' button...", () => {
        test(`Should be present in the document`, async () => {
            await act(async () => { await renderComponent() });
            const listViewingButton = screen.getByRole("listitem", { name: "list-viewing-button" });
            expect(listViewingButton).toBeInTheDocument();
        });
    });
    describe("The friends list...", () => {
        test(`Should be present in the document if the 'defaultList' prop value
         is equal to "friends"`, async () => {
            await act(async () => { await renderComponent("friends") });
            const friendsList = screen.getByRole("list", { name: "friends-list" });
            expect(friendsList).toBeInTheDocument();
        });
        test(`Should be present in the document if the 'defaultList' prop value
         is equal to "requests"`, async () => {
            await act(async () => { await renderComponent("requests") });
            const friendsList = screen.queryByRole("list", { name: "friends-list" });
            expect(friendsList).toBeNull();
        });
        test(`Should have as many 'Friend' component children as there are
         friends returned by the 'getFriendsList' API function`, async () => {
            await act(async () => { await renderComponent("friends") });
            const Friends = screen.getAllByRole("listitem", { name: "friend" });
            expect(Friends.length).toBe(friendsList.length);
        });
    });
    describe("The friend requests list...", () => {
        test(`Should be present in the document if the 'defaultList' prop value
            is equal to "requests"`, async () => {
            await act(async () => { await renderComponent("requests") });
            const friendRequestsList = screen.getByRole("list", { name: "friend-requests-list" });
            expect(friendRequestsList).toBeInTheDocument();
        });
        test(`Should be present in the document if the 'defaultList' prop value
            is equal to "friends"`, async () => {
                await act(async () => { await renderComponent("friends") });
            const friendRequestsList = screen.queryByRole("list", { name: "friend-requests-list" });
            expect(friendRequestsList).toBeNull();
        });
        test(`Should have as many 'FriendRequest' component children as there are
         friends returned by the 'getFriendRequests' API function`, async () => {
            await act(async () => { await renderComponent("requests") });
            const FriendRequests = screen.getAllByRole("listitem", { name: "friend-request" });
            expect(FriendRequests.length).toBe(friendRequests.length);
        });
    });
    describe("The 'AddFriendPanel' component...", () => {
        test(`Should be present in the document if the 'addingFriendDefault'
         prop value is equal to 'true'`, async () => {
            await act(async () => { await renderComponent("friends", true) });
            const addFriendPanel = screen.getByRole("generic", { name: "add-friend-panel" });
            expect(addFriendPanel).toBeInTheDocument();
        });
        test(`Should not be present in the document if the 'addingFriendDefault'
         prop value is equal to 'false'`, async () => {
            await act(async () => { await renderComponent("friends", false) });
            const addFriendPanel = screen.queryByRole("generic", { name: "add-friend-panel" });
            expect(addFriendPanel).toBeNull();
        });
    });
});