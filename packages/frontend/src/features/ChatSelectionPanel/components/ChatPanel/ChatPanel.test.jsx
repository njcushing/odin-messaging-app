/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ChatPanel from './index.jsx'

const renderComponent = async () => { await act(() => render(<ChatPanel />)); }

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

vi.mock('@/components/Message', () => ({ 
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

vi.mock('@/components/MessageBox', () => ({ 
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
    participants: [...participants],
    chatName: "",
    imageSrc: "",
    imageAlt: "",
    messages: [...messages],
}
const getChatFromAPI = vi.fn(() => chat);
vi.mock('./utils/getChatFromAPI', async () => ({
    default: () => getChatFromAPI(),
}));

const combineParticipantNames = vi.fn(() => "Combined");
vi.mock('./utils/combineParticipantNames', async () => ({
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
            getChatFromAPI.mockReturnValueOnce({
                ...chat,
                chatName: "Custom Chat Name",
            });
            await act(() => renderComponent());
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName).toBeInTheDocument();
        });
        test(`Should display the custom chat name`, async () => {
            getChatFromAPI.mockReturnValueOnce({
                ...chat,
                chatName: "Custom Chat Name",
            });
            await act(() => renderComponent());
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName.textContent).toBe("Custom Chat Name");
        });
    });
    describe("The heading element displaying the participants' names...", () => {
        test(`Should not be present in the document if a custom chat name is
         set`, async () => {
            getChatFromAPI.mockReturnValueOnce({
                ...chat,
                chatName: "Custom Chat Name",
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
        test(`Should display the custom chat name`, async () => {
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
         the 'getChatFromAPI' function (if there is at least 1 message)`, async () => {
            await act(() => renderComponent());
            const chatMessages = screen.getAllByRole("listitem", { name: "chat-message" });
            expect(chatMessages.length).toBe(3);
        });
        test(`Should display information about there being no messages sent in
         the chat yet (if there are no messages)`, async () => {
            getChatFromAPI.mockReturnValueOnce({
                ...chat,
                messages: [],
            });
            await act(() => renderComponent());
            const emptyChatText = screen.getByRole("heading", { name: "empty-chat-text" });
            expect(emptyChatText).toBeInTheDocument();
        });
    });
});