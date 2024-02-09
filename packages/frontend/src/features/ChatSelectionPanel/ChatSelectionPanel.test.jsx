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
    describe("The chat list...", () => {
        test(`Should contain a heading element for the title`, async () => {
            await act(() => renderComponent());
            const chatListTitle = screen.getByRole("heading", { name: "chat-list-title" });
            expect(chatListTitle).toBeInTheDocument();
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