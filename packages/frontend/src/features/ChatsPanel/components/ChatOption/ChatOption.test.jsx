/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ChatOption from './index.jsx'

const renderComponent = async (
    chat = null,
    onClickHandler = () => {},
) => {
    act(() => render(<ChatOption
        chat={chat}
        onClickHandler={onClickHandler}
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

const combineParticipantNames = vi.fn(() => "Combined");
vi.mock('../../utils/combineParticipantNames.js', async () => ({
    default: () => combineParticipantNames(),
}));

const chatProps = {
    name: "",
    recentMessage: {
        author: "Friend 1",
        message: "Recent message",
    },
    status: null,
    image: {
        src: new Uint8Array([]),
        alt: "",
        status: null,
    },
};
const calculateProps = vi.fn(() => chatProps);
vi.mock("./utils/calculateChatOptionProps.js", async () => {
    const actual = await vi.importActual("./utils/calculateChatOptionProps.js");
    return {
        ...actual,
        calculateProps: () => calculateProps(),
    };
});

describe("UI/DOM Testing...", () => {
    describe("The element...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const container = screen.getByRole("generic", { name: "chat-option" });
            expect(container).toBeInTheDocument();
        });
        test(`When clicked, should invoke the provided callback function`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            
            await renderComponent(null, callback);
            const container = screen.getByRole("generic", { name: "chat-option" });

            fireEvent.mouseLeave(container);
            await user.click(container);

            expect(callback).toHaveBeenCalled();
        });
    });
    describe("The element displaying the name of the chat...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName).toBeInTheDocument();
        });
    });
    describe("The element displaying the recent message...", () => {
        test(`Should be present in the document if the 'recentMessage' prop does
         not have a value of 'null'`, async () => {
            await renderComponent();
            const recentMessage = screen.getByRole("heading", { name: "most-recent-message" });
            expect(recentMessage).toBeInTheDocument();
        });
        test(`Should not be present in the document if the 'recentMessage' prop
         has a value of 'null'`, async () => {
            calculateProps.mockReturnValueOnce({
                ...chatProps,
                recentMessage: null,
            });
            await renderComponent();
            const recentMessage = screen.queryByRole("heading", { name: "most-recent-message" });
            expect(recentMessage).toBeNull();
        });
    });
});