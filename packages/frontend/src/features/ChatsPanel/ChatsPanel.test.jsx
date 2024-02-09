/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ChatsPanel from './index.jsx'

import * as getChatsList from "./utils/getChatsList.js";
import * as createChat from "./utils/createChat.js";

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

// For 'ResizeObserver is not defined' error
class ResizeObserver {
    observe() {}
    unobserve() {}
}
window.ResizeObserver = ResizeObserver;

const renderComponent = async (
    createChatPanelOpenDefault = false,
    userId = "",
) => {
    act(() => render(<ChatsPanel
        createChatPanelOpenDefault={createChatPanelOpenDefault}
        userId={userId}
    />));
}

vi.mock('@/components/OptionButton', () => ({ 
    default: ({
        text,
        label,
        tooltipText,
        tooltipPosition,
        widthPx,
        heightPx,
        fontSizePx,
        borderType,
        onClickHandler,
    }) => {
        return (
            <button
                aria-label={label}
                onClick={() => onClickHandler()}
            ></button>
        );
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
        return (
            <div
                aria-label="friend-selector-panel"
            >
                <button
                    aria-label="friend-selector-panel-close-button"
                    onClick={() => onCloseHandler()}
                ></button>
                <button
                    aria-label="friend-selector-panel-submit-button"
                    onClick={() => onSubmitHandler(new Set([1, 2, 3]))}
                ></button>
            </div>
        );
    }
}));

vi.mock('./components/ChatOption', () => ({ 
    default: ({
        chat,
        onClickHandler,
        userId,
    }) => {
        return (
            <button
                aria-label="chat-option-mock"
                onClick={() => onClickHandler()}
            >{chat._id}</button>
        );
    }
}));

vi.mock('./components/ChatPanel', () => ({ 
    default: ({
        chatId,
        userId,
        messageSentHandler,
        addedFriendsHandler,
        updatedChatImageHandler,
    }) => {
        return (
            <div
                aria-label="chat-panel-mock"
            >
                <button
                    aria-label="chat-panel-mock-message-sent-button"
                    onClick={() => messageSentHandler({
                        _id: 0,
                        author: 0,
                        text: "message text",
                        image: null,
                    })}
                ></button>
                <button
                    aria-label="chat-panel-mock-added-friends-button"
                    onClick={() => addedFriendsHandler()}
                ></button>
                <button
                    aria-label="chat-panel-mock-updated-chat-image-button"
                    onClick={() => updatedChatImageHandler()}
                ></button>
                {chatId}
            </div>);
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
    {
        _id: "2",
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
const getChatsListMock = vi.fn(() => {
    return {
        status: 200,
        message: "Chats found.",
        chats: chats,
    }
});
vi.mock('./utils/getChatsList', async () => ({
    default: () => getChatsListMock(),
}));

const createChatMock = vi.fn(() => {
    return {
        status: 200,
        message: "Chat created.",
        chatId: 0,
    }
});
vi.mock('./utils/createChat', async () => ({
    default: () => createChatMock(),
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
            const createChatButton = screen.getByRole("button", { name: "create-chat" });
            expect(createChatButton).toBeInTheDocument();
        });
        test(`Should, when clicked, open the FriendSelectorPanel component`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            let friendSelectorPanel;

            friendSelectorPanel = screen.queryByRole("generic", { name: "friend-selector-panel" });
            expect(friendSelectorPanel).toBeNull();

            const createChatButton = screen.getByRole("button", { name: "create-chat" });
            await user.click(createChatButton);

            friendSelectorPanel = screen.getByRole("generic", { name: "friend-selector-panel" });
            expect(friendSelectorPanel).toBeInTheDocument();
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
    describe("The 'Load More' button...", () => {
        test(`Should be present in the document`, async () => {
            await act(async () => { await renderComponent() });
            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            expect(loadMoreButton).toBeInTheDocument();
        });
        test(`Should, when clicked, attempt to append more chats to the end of
         the chats list`, async () => {
            const user = userEvent.setup();
            getChatsListMock.mockReturnValueOnce({
                status: 200,
                message: "Found",
                chats: [chats[0]],
            }).mockReturnValueOnce({
                status: 200,
                message: "Found",
                chats: [chats[1]],
            });
            await act(async () => { await renderComponent() });
            const chatsBefore = screen.getAllByRole("listitem", { name: "chat-option" });
            expect(chatsBefore.length).toBe(1);
            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            fireEvent.mouseLeave(loadMoreButton);
            await user.click(loadMoreButton);
            const chatsAfter = screen.getAllByRole("listitem", { name: "chat-option" });
            expect(chatsAfter.length).toBe(2);
        });
    });
    describe("Each chat option in the chats list...", () => {
        test(`When clicked, should attempt to open the chat`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const chatOptions = screen.getAllByRole("button", { name: "chat-option-mock" });
            await user.click(chatOptions[0]);
            const chatPanel = screen.getByRole("generic", { name: "chat-panel-mock" });
            expect(chatPanel.textContent).toBe(chats[0]._id);
        });
    });
    describe("The 'FriendSelectorPanel' component...", () => {
        test(`Should be present in the document if the
         'createChatPanelOpenDefault' prop value is equal to 'true'`, async () => {
            await act(async () => { await renderComponent(true) });
            const friendSelectorPanel = screen.getByRole("generic", { name: "friend-selector-panel" });
            expect(friendSelectorPanel).toBeInTheDocument();
        });
        test(`Should not be present in the document if the
         'createChatPanelOpenDefault' prop value is equal to 'false'`, async () => {
            await act(async () => { await renderComponent(false) });
            const friendSelectorPanel = screen.queryByRole("generic", { name: "friend-selector-panel" });
            expect(friendSelectorPanel).toBeNull();
        });
        test(`Should not be present in the document if its 'onCloseHandler'
         callback function is invoked while it is open`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent(true) });
            let friendSelectorPanel;
            friendSelectorPanel = screen.getByRole("generic", { name: "friend-selector-panel" });
            expect(friendSelectorPanel).toBeInTheDocument();
            const friendSelectorPanelCloseButton = screen.getByRole("button", { name: "friend-selector-panel-close-button" });
            await user.click(friendSelectorPanelCloseButton);
            friendSelectorPanel = screen.queryByRole("generic", { name: "friend-selector-panel" });
            expect(friendSelectorPanel).toBeNull();
        });
        test(`Should invoke the 'createChat' API function if its
         'onSubmitHandler' callback function is invoked`, async () => {
            const createChatSpy = vi.spyOn(createChat, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent(true); });
            const friendSelectorPanelSubmitButton = screen.getByRole("button", { name: "friend-selector-panel-submit-button" });
            await user.click(friendSelectorPanelSubmitButton);
            expect(createChatSpy).toHaveBeenCalled();
        });
        test(`Which should invoke the 'getChatsList' API function`, async () => {
            const getChatsListSpy = vi.spyOn(getChatsList, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent(true); });
            const friendSelectorPanelSubmitButton = screen.getByRole("button", { name: "friend-selector-panel-submit-button" });
            await user.click(friendSelectorPanelSubmitButton);
            expect(getChatsListSpy).toHaveBeenCalled();
        });
        test(`Unless the response from the 'createChat' API function has a
         status code of >= 400`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent(true); });
            const getChatsListSpy = vi.spyOn(getChatsList, "default");
            createChatMock.mockReturnValueOnce({
                status: 400,
                message: "Bad data",
                chatId: null,
            });
            const friendSelectorPanelSubmitButton = screen.getByRole("button", { name: "friend-selector-panel-submit-button" });
            await user.click(friendSelectorPanelSubmitButton);
            expect(getChatsListSpy).not.toHaveBeenCalled();
        });
    });
    describe("The 'ChatPanel' component...", () => {
        test(`Should be present in the document if the FriendSelectorPanel
         component is not open`, async () => {
            await act(async () => { await renderComponent(false); });
            const user = userEvent.setup();
            const chatPanel = screen.getByRole("generic", { name: "chat-panel-mock" });
            expect(chatPanel).toBeInTheDocument();
        });
        test(`Should not be present in the document if the FriendSelectorPanel
         component is open`, async () => {
            await act(async () => { await renderComponent(true); });
            const user = userEvent.setup();
            const chatPanel = screen.queryByRole("generic", { name: "chat-panel-mock" });
            expect(chatPanel).toBeNull();
        });
        test(`Should add the new message to the appropriate chat if the
         'messageSentHandler' callback function is invoked, also shifting that
         chat to the top of the chatsList`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent(); });
            const chatOptionsBefore = screen.getAllByRole("button", { name: "chat-option-mock" });
            expect(chatOptionsBefore[1].textContent).toBe("2");
            await user.click(chatOptionsBefore[1]);
            const chatPanelMessageSentButton = screen.getByRole("button", { name: "chat-panel-mock-message-sent-button" });
            await user.click(chatPanelMessageSentButton);
            const chatOptionsAfter = screen.getAllByRole("button", { name: "chat-option-mock" });
            expect(chatOptionsAfter[0].textContent).toBe("2");
        });
        test(`Should invoke the 'getChatsList' API function if its
         'addedFriendsHandler' callback function is invoked`, async () => {
            const getChatsListSpy = vi.spyOn(getChatsList, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent(); });
            const chatPanelAddedFriendsButton = screen.getByRole("button", { name: "chat-panel-mock-added-friends-button" });
            await user.click(chatPanelAddedFriendsButton);
            expect(getChatsListSpy).toHaveBeenCalled();
        });
        test(`Should invoke the 'getChatsList' API function if its
         'updatedChatImageHandler' callback function is invoked`, async () => {
            const getChatsListSpy = vi.spyOn(getChatsList, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent(); });
            const chatPanelUpdatedChatImageButton = screen.getByRole("button", { name: "chat-panel-mock-updated-chat-image-button" });
            await user.click(chatPanelUpdatedChatImageButton);
            expect(getChatsListSpy).toHaveBeenCalled();
        });
    });
});