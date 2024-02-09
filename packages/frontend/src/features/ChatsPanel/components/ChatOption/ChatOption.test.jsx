/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ChatOption from './index.jsx'

const renderComponent = async (
    name = "Chat Name",
    participants = [],
    recentMessage = {
        author: "Person 1",
        message: "Recent Message",
    },
    status = "online",
    imageSrc = "image_src",
    imageAlt = "image alt",
    onClickHandler = () => {},
) => {
    act(() => render(<ChatOption
        name={name}
        participants={participants}
        recentMessage={recentMessage}
        status={status}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        onClickHandler={onClickHandler}
    />));
}

const combineParticipantNames = vi.fn(() => "Combined");
vi.mock('../../utils/combineParticipantNames.js', async () => ({
    default: () => combineParticipantNames(),
}));

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
            
            await renderComponent(
                "Chat Name",
                [],
                { author: "Person 1", message: "Recent Message" },
                "online",
                "",
                "",
                callback,
            );
            const container = screen.getByRole("generic", { name: "chat-option" });

            await user.click(container);

            expect(callback).toHaveBeenCalled();
        });
    });
    describe("The element displaying the status indicator...", () => {
        test(`Should not be present in the document if the provided 'status'
         prop's value is null`, async () => {
            await renderComponent(
                "Chat Name",
                [],
                { author: "Person 1", message: "Recent Message" },
                null,
                "",
                "",
                () => {},
            );
            const statusIndicator = screen.queryByRole("generic", { name: "status-indicator" });
            expect(statusIndicator).toBeNull();
        });
        test(`Should be present in the document if the provided 'status' prop's
         value is not null`, async () => {
            await renderComponent();
            const statusIndicator = screen.queryByRole("generic", { name: "status-indicator" });
            expect(statusIndicator).toBeInTheDocument();
        });
    });
    describe("The element displaying the name of the chat...", () => {
        test(`Should be present in the document if the 'name' prop has a value
         of a string longer than 0 characters`, async () => {
            await renderComponent();
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName).toBeInTheDocument();
        });
        test(`Should have textContent equal to the value of the 'name' prop`, async () => {
            await renderComponent();
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName.textContent).toBe("Chat Name");
        });
        test(`Should not be present in the document if the 'name' prop is not
         specified and there is at least one participant`, async () => {
            await renderComponent(
                "",
                ["Person 1"],
                { author: "Person 1", message: "Recent Message" },
                null,
                "",
                "",
                () => {},
            );
            const chatName = screen.queryByRole("heading", { name: "chat-name" });
            expect(chatName).toBeNull();
        });
        test(`Should be present in the document if the 'name' prop is not
         specified and there are no participants, with a generic textContent
         value`, async () => {
            await renderComponent(
                "",
                [],
                { author: "Person 1", message: "Recent Message" },
                null,
                "",
                "",
                () => {},
            );
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName).toBeInTheDocument();
        });
    });
    describe("The element displaying the name of the participants...", () => {
        test(`Should not be present in the document if the 'name' prop has a
         value of a string longer than 0 characters`, async () => {
            await renderComponent();
            const chatNameParticipants = screen.queryByRole("heading", { name: "chat-participants" });
            expect(chatNameParticipants).toBeNull();
        });
        test(`Should be present in the document if the 'name' prop is not
         specified and there is at least one participant`, async () => {
            await renderComponent(
                "",
                ["Person 1"],
                { author: "Person 1", message: "Recent Message" },
                null,
                "",
                "",
                () => {},
            );
            const chatNameParticipants = screen.getByRole("heading", { name: "chat-participants" });
            expect(chatNameParticipants).toBeInTheDocument();
        });
        test(`Should have textContent equal to that returned by the
         'combineParticipantNames' utility function`, async () => {
            await renderComponent(
                "",
                ["Person 1"],
                { author: "Person 1", message: "Recent Message" },
                null,
                "",
                "",
                () => {},
            );
            const chatNameParticipants = screen.getByRole("heading", { name: "chat-participants" });
            expect(chatNameParticipants.textContent).toBe("Combined");
        });
        test(`Should not be present in the document if the 'name' prop is not
         specified and there are no participants, with a generic textContent
         value`, async () => {
            await renderComponent(
                "",
                [],
                { author: "Person 1", message: "Recent Message" },
                null,
                "",
                "",
                () => {},
            );
            const chatNameParticipants = screen.queryByRole("heading", { name: "chat-participants" });
            expect(chatNameParticipants).toBeNull();
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
            await renderComponent(
                "Chat Name",
                [],
                null,
                "online",
                "",
                "",
                () => {},
            );
            const recentMessage = screen.queryByRole("heading", { name: "most-recent-message" });
            expect(recentMessage).toBeNull();
        });
    });
});