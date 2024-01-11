/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ChatPanel from './index.jsx'

import mongoose from "mongoose";

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

const renderComponent = async (
    chatId = new mongoose.Types.ObjectId(),
) => {
    act(() => render(<ChatPanel
        chatId={chatId}
    />));
}

vi.mock('@/components/ProfileImage', () => ({ 
    default: ({
        src,
        alt,
        sizePx,
    }) => {
        return (<></>);
    }
}));

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

vi.mock('../../components/Message', () => ({ 
    default: ({
        text,
        name,
        dateSent,
        imageSrc,
        imageAlt,
        position,
    }) => {
        return (<></>);
    }
}));

vi.mock('../../components/MessageBox', () => ({ 
    default: ({
        text,
        placeholder,
        submissionErrors,
        onSubmitHandler,
    }) => {
        return (<></>);
    }
}));

const participants = [
    {
        _id: "1",
        name: "Person 1",
    },
    {
        _id: "2",
        name: "Person 2",
    },
    {
        _id: "3",
        name: "Person 3",
    },
];
const messages = [
    {
        _id: "3",
        author: {
            _id: "2",
            name: "Person 2",
            status: "online",
            imageSrc: "",
            imageAlt: "",
        },
        text: "Message 3 text",
        dateSent: "2023-01-01T00:00:00",
    },
    {
        _id: "2",
        author: {
            _id: "3",
            name: "Person 3",
            status: "online",
            imageSrc: "",
            imageAlt: "",
        },
        text: "Message 2 text",
        dateSent: "2023-01-01T00:00:00",
    },
    {
        _id: "1",
        author: {
            _id: "1",
            name: "Person 1",
            status: "online",
            imageSrc: "",
            imageAlt: "",
        },
        text: "Message 1 text",
        dateSent: "2023-01-01T00:00:00",
    },
];
const chat = {
    participants: participants,
    name: "",
    imageSrc: "",
    imageAlt: "",
    messages: messages,
}
const getChat = vi.fn(() => {
    return {
        status: 200,
        message: "Chat found.",
        chat: chat,
    };
});
vi.mock('./utils/getChat', async () => ({
    default: () => getChat(),
}));

const combineParticipantNames = vi.fn(() => "Combined");
vi.mock('../../utils/combineParticipantNames', async () => ({
    default: () => combineParticipantNames(),
}));

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the chat name...", () => {
        test(`Should not be present in the document if no custom chat name is
         set`, async () => {
            await act(() => renderComponent());
            const chatName = screen.queryByRole("heading", { name: "chat-name" });
            expect(chatName).toBeNull();
        });
        test(`Should be present in the document if a custom chat name is set`, async () => {
            getChat.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    name: "Custom Chat Name",
                },
            });
            await act(() => renderComponent());
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName).toBeInTheDocument();
        });
        test(`Should have textContent equal to the custom chat name`, async () => {
            getChat.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    name: "Custom Chat Name",
                },
            });
            await act(() => renderComponent());
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName.textContent).toBe("Custom Chat Name");
        });
    });
    describe("The heading element displaying the participants' names...", () => {
        test(`Should not be present in the document if a custom chat name is
         set`, async () => {
            getChat.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    name: "Custom Chat Name",
                },
            });
            await act(() => renderComponent());
            const chatParticipants = screen.queryByRole("heading", { name: "chat-participants" });
            expect(chatParticipants).toBeNull();
        });
        test(`Should be present in the document if no custom chat name is set`, async () => {
            await act(() => renderComponent());
            const chatParticipants = screen.getByRole("heading", { name: "chat-participants" });
            expect(chatParticipants).toBeInTheDocument();
        });
        test(`Should have textContent equal to that returned by the
         'combineParticipantNames' function`, async () => {
            await act(() => renderComponent());
            const chatParticipants = screen.getByRole("heading", { name: "chat-participants" });
            expect(chatParticipants.textContent).toBe("Combined");
        });
    });
    describe("The list element displaying the chat options...", () => {
        test(`Should be present in the document`, async () => {
            await act(() => renderComponent());
            const chatOptions = screen.getByRole("list", { name: "chat-options" });
            expect(chatOptions).toBeInTheDocument();
        });
    });
    describe("The list element displaying the messages...", () => {
        test(`Should be present in the document`, async () => {
            await act(() => renderComponent());
            const chatMessageList = screen.getByRole("list", { name: "chat-message-list" });
            expect(chatMessageList).toBeInTheDocument();
        });
        test(`Should have the same number of children as messages returned from
         the 'getChat' function (if there is at least 1 message)`, async () => {
            await act(() => renderComponent());
            const chatMessages = screen.getAllByRole("listitem", { name: "chat-message" });
            expect(chatMessages.length).toBe(3);
        });
        test(`Should display information about there being no messages sent in
         the chat yet (if there are no messages)`, async () => {
            getChat.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    messages: [],
                },
            });
            await act(() => renderComponent());
            const emptyChatText = screen.getByLabelText("empty-chat-text");
            expect(emptyChatText).toBeInTheDocument();
        });
    });
    describe("A 'no chat' message...", () => {
        test(`Should be present if the chat returned by the 'getChat' function
         is null`, async () => {
            getChat.mockReturnValueOnce({
                status: 404,
                message: "Chat not found.",
                chat: null,
            });
            await act(() => renderComponent());
            const emptyChatMessage = screen.getByLabelText("no-chat-here");
            expect(emptyChatMessage).toBeInTheDocument();
        });
        test(`Should not be present if the chat returned by the 'getChat'
         function is not null`, async () => {
            await act(() => renderComponent());
            const emptyChatMessage = screen.queryByLabelText("no-chat-here");
            expect(emptyChatMessage).toBeNull();
        });
    });
});