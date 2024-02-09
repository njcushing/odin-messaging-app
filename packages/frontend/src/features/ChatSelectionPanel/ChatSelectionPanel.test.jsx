/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ChatSelectionPanel from './index.jsx'

const renderComponent = async () => {
    act(() => render(
        <ChatSelectionPanel
            chatType="friends"
        />
    ));
}

vi.mock('@/components/ChatOption', () => ({ 
    default: ({
        name,
        tagLine,
        status,
        imageSrc,
        imageAlt,
        onClickHandler,
    }) => {
        return (<></>);
    }
}));

vi.mock('@/components/ChatPanel', () => ({ 
    default: () => {
        return (<></>);
    }
}));

const friendsChatList = [
    {
        name: "Chat 1",
        tagLine: "Chat 1 tagline",
        status: "online",
        imageSrc: "",
        imageAlt: "",
    },
    {
        name: "Chat 2",
        tagLine: "Chat 2 tagline",
        status: "away",
        imageSrc: "",
        imageAlt: "",
    },
    {
        name: "Chat 3",
        tagLine: "Chat 3 tagline",
        status: "busy",
        imageSrc: "",
        imageAlt: "",
    },
];
const groupsChatList = [
    {
        name: "Chat 1",
        tagLine: "Chat 1 tagline",
        status: "online",
        imageSrc: "",
        imageAlt: "",
    },
    {
        name: "Chat 2",
        tagLine: "Chat 2 tagline",
        status: "away",
        imageSrc: "",
        imageAlt: "",
    },
];
const communitiesChatList = [
    {
        name: "Chat 1",
        tagLine: "Chat 1 tagline",
        status: "online",
        imageSrc: "",
        imageAlt: "",
    },
];
const friends = vi.fn(() => friendsChatList)
const groups = vi.fn(() => groupsChatList);
const communities = vi.fn(() => communitiesChatList);
vi.mock('./utils/getChatListFromAPI', async () => {
    const actual = await vi.importActual("./utils/getChatListFromAPI");
    return {
        ...actual,
        friends: () => friends(),
        groups: () => groups(),
        communities: () => communities(),
    }
});

describe("UI/DOM Testing...", () => {
    describe("The chat selection panel...", () => {
        test(`Should contain a heading element for the title`, async () => {
            await act(() => renderComponent());
            const chatListTitle = screen.getByRole("heading", { name: "chat-list-title" });
            expect(chatListTitle).toBeInTheDocument();
        });
    });
    describe("The chat selection panel options list...", () => {
        test(`Should be present in the document if the value of the 'chatType'
         prop is set to 'friends'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="friends"
                />
            ));
            const chatSelectionPanelOptionsList = screen.getByRole("list", { name: "chat-selection-panel-options-list" });
            expect(chatSelectionPanelOptionsList).toBeInTheDocument();
        });
        test(`Should be present in the document if the value of the 'chatType'
         prop is set to 'groups'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="groups"
                />
            ));
            const chatSelectionPanelOptionsList = screen.getByRole("list", { name: "chat-selection-panel-options-list" });
            expect(chatSelectionPanelOptionsList).toBeInTheDocument();
        });
        test(`Should not be present in the document if the value of the
         'chatType' prop is set to 'communities'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="communities"
                />
            ));
            const chatSelectionPanelOptionsList = screen.queryByRole("list", { name: "chat-selection-panel-options-list" });
            expect(chatSelectionPanelOptionsList).toBeNull();
        });
    });
    describe("The 'Add Friend' option...", () => {
        test(`Should be present in the document if the value of the 'chatType'
         prop is set to 'friends'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="friends"
                />
            ));
            const addFriendButton = screen.getByRole("listitem", { name: "add-friend-button" });
            expect(addFriendButton).toBeInTheDocument();
        });
        test(`Should not be present in the document if the value of the
         'chatType' prop is set to 'groups'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="groups"
                />
            ));
            const addFriendButton = screen.queryByRole("listitem", { name: "add-friend-button" });
            expect(addFriendButton).toBeNull();
        });
        test(`Should not be present in the document if the value of the
         'chatType' prop is set to 'communities'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="communities"
                />
            ));
            const addFriendButton = screen.queryByRole("listitem", { name: "add-friend-button" });
            expect(addFriendButton).toBeNull();
        });
    });
    describe("The 'Add Friend' option...", () => {
        test(`Should be present in the document if the value of the 'chatType'
         prop is set to 'friends'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="friends"
                />
            ));
            const createChatButton = screen.getByRole("listitem", { name: "create-chat-button" });
            expect(createChatButton).toBeInTheDocument();
        });
        test(`Should be present in the document if the value of the 'chatType'
         prop is set to 'groups'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="groups"
                />
            ));
            const createChatButton = screen.getByRole("listitem", { name: "create-chat-button" });
            expect(createChatButton).toBeInTheDocument();
        });
        test(`Should not be present in the document if the value of the
         'chatType' prop is set to 'communities'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="communities"
                />
            ));
            const createChatButton = screen.queryByRole("listitem", { name: "create-chat-button" });
            expect(createChatButton).toBeNull();
        });
    });
    describe("The chat list...", () => {
        test(`Should be present in the document`, async () => {
            await act(() => renderComponent());
            const chatList = screen.getByRole("list", { name: "chat-list-options" });
            expect(chatList).toBeInTheDocument();
        });
        test(`Should contain the correct number of messages if the value of the
         'chatType' prop is set to 'friends'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="friends"
                />
            ));
            const chatListOptions = screen.getAllByRole("listitem", { name: "chat-option" });
            expect(chatListOptions.length).toBe(3);
        });
        test(`Should contain the correct number of messages if the value of the
         'chatType' prop is set to 'friends'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="groups"
                />
            ));
            const chatListOptions = screen.getAllByRole("listitem", { name: "chat-option" });
            expect(chatListOptions.length).toBe(2);
        });
        test(`Should contain the correct number of messages if the value of the
         'chatType' prop is set to 'friends'`, async () => {
            await act(async () => render(
                <ChatSelectionPanel
                    chatType="communities"
                />
            ));
            const chatListOptions = screen.getAllByRole("listitem", { name: "chat-option" });
            expect(chatListOptions.length).toBe(1);
        });
    });
});