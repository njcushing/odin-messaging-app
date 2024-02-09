/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ChatsPanel from './index.jsx'

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

const renderComponent = async (
    creatingChatDefault = false,
) => {
    act(() => render(<ChatsPanel
        creatingChatDefault={creatingChatDefault}
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

vi.mock('./components/FriendSelectorPanel', () => ({
    default: ({
        title,
        removeButtonText,
        addButtonText,
        submitButtonText,
        noFriendsText,
        onCloseHandler,
        onSubmitHandler,
        submissionErrors,
    }) => {
        return (<div aria-label="friend-selector-panel"></div>);
    }
}));

vi.mock('./components/ChatOption', () => ({ 
    default: ({
        name,
        participants,
        recentMessage,
        status,
        imageSrc,
        imageAlt,
        onClickHandler,
    }) => {
        return (<></>);
    }
}));

vi.mock('./components/ChatPanel', () => ({ 
    default: ({
        chatId,
    }) => {
        return (<></>);
    }
}));

const chats = [
    {
        _id: "1",
        name: "",
        participants: [
            {
                username: "Elizabeth",
                displayName: "eliza",
                status: "online",
            },
            {
                username: "William",
                displayName: "will",
                status: "away",
            },
            {
                username: "Jennifer",
                displayName: "jen",
                status: "offline",
            },
        ],
        recentMessage: {
            author: "Elizabeth",
            message: "Hello guys! Nice to finally speak to you all.",
        },
        imageSrc: "",
        imageAlt: "",
    },
];
const getChatsList = vi.fn(() => {
    return {
        status: 200,
        message: "Chats found.",
        chats: chats,
    }
});
vi.mock('./utils/getChatsList', async () => ({
    default: () => getChatsList(),
}));

describe("UI/DOM Testing...", () => {
    describe("The chats panel...", () => {
        test(`Should contain a heading element for the title`, async () => {
            await act(async () => { await renderComponent() });
            const chatsPanelTitle = screen.getByRole("heading", { name: "chats-panel-title" });
            expect(chatsPanelTitle).toBeInTheDocument();
        });
    });
    describe("The 'Create New Chat' button...", () => {
        test(`Should be present in the document`, async () => {
            await act(async () => { await renderComponent() });
            const createNewChatButton = screen.getByRole("listitem", { name: "create-chat-button" });
            expect(createNewChatButton).toBeInTheDocument();
        });
    });
    describe("The chats list...", () => {
        test(`Should be present in the document`, async () => {
            await act(async () => { await renderComponent() });
            const chatsList = screen.getByRole("list", { name: "chat-options-list" });
            expect(chatsList).toBeInTheDocument();
        });
        test(`Should have as many 'ChatOption' component children as there are
         chats returned by the 'getChatsList' API function`, async () => {
            await act(async () => { await renderComponent() });
            const chatOptions = screen.getAllByRole("listitem", { name: "chat-option" });
            expect(chatOptions.length).toBe(chats.length);
        });
    });
    describe("The 'FriendSelectorPanel' component...", () => {
        test(`Should be present in the document if the 'creatingChatDefault'
         prop value is equal to 'true'`, async () => {
            await act(async () => { await renderComponent(true) });
            const friendSelectorPanel = screen.getByRole("generic", { name: "friend-selector-panel" });
            expect(friendSelectorPanel).toBeInTheDocument();
        });
        test(`Should not be present in the document if the 'creatingChatDefault'
         prop value is equal to 'false'`, async () => {
            await act(async () => { await renderComponent(false) });
            const friendSelectorPanel = screen.queryByRole("generic", { name: "friend-selector-panel" });
            expect(friendSelectorPanel).toBeNull();
        });
    });
});