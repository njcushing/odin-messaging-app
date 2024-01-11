/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import FriendRequest from './index.jsx'

import * as acceptFriendRequest from "../../utils/acceptFriendRequest.js";
import * as declineFriendRequest from "../../utils/declineFriendRequest.js";

const renderComponent = async (
    username = "Person 1",
    imageSrc = "",
    imageAlt = "",
    onSuccessHandler = () => {},
) => {
    act(() => render(<FriendRequest
        username={username}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        onSuccessHandler={onSuccessHandler}
    />));
}

vi.mock('@/components/ProfileImage', () => ({ 
    default: ({
        src,
        alt,
        sizePx,
    }) => {
        return (<div aria-label="profile-image"></div>);
    }
}));

const acceptFriendRequestMock = vi.fn(() => {
    return {
        status: 200,
        message: "Success",
    }
});
vi.mock('../../utils/acceptFriendRequest', async () => ({
    default: () => acceptFriendRequestMock(),
}));

const declineFriendRequestMock = vi.fn(() => {
    return {
        status: 200,
        message: "Success",
    }
});
vi.mock('../../utils/declineFriendRequest', async () => ({
    default: () => declineFriendRequestMock(),
}));

describe("UI/DOM Testing...", () => {
    describe("The profile image...", () => {
        test(`Should be present in the document by default`, async () => {
            await act(async () => { await renderComponent() });
            const profileImage = screen.getByRole("generic", { name: "profile-image" });
            expect(profileImage).toBeInTheDocument();
        });
        test(`Should not be present in the document after a successful response
         from the 'acceptFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const acceptButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(acceptButton);
            const profileImage = screen.queryByRole("generic", { name: "profile-image" });
            expect(profileImage).toBeNull();
        });
        test(`Should not be present in the document after a successful response
         from the 'declineFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const declineButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(declineButton);
            const profileImage = screen.queryByRole("generic", { name: "profile-image" });
            expect(profileImage).toBeNull();
        });
    });
    describe("The username...", () => {
        test(`Should be present in the document by default`, async () => {
            await act(async () => { await renderComponent() });
            const username = screen.getByText("Person 1");
            expect(username).toBeInTheDocument();
        });
        test(`Should not be present in the document after a successful response
         from the 'acceptFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const acceptButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(acceptButton);
            const username = screen.queryByText("Person 1");
            expect(username).toBeNull();
        });
        test(`Should not be present in the document after a successful response
         from the 'declineFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const declineButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(declineButton);
            const username = screen.queryByText("Person 1");
            expect(username).toBeNull();
        });
    });
    describe("The 'Accept' button...", () => {
        test(`Should be present in the document by default`, async () => {
            await act(async () => { await renderComponent() });
            const acceptButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            expect(acceptButton).toBeInTheDocument();
        });
        test(`Should not be present in the document after a successful response
         from the 'acceptFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const acceptButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(acceptButton);
            expect(acceptButton).not.toBeInTheDocument();
        });
        test(`Should not be present in the document after a successful response
         from the 'declineFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const declineButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(declineButton);
            const acceptButton = screen.queryByRole("button", { name: "accept-friend-request-button" });
            expect(acceptButton).toBeNull();
        });
        test(`When clicked, should invoke the 'acceptFriendRequest' API
         function`, async () => {
            const user = userEvent.setup();
            const acceptFriendRequestSpy = vi.spyOn(acceptFriendRequest, "default");
            await act(async () => { await renderComponent() });
            const acceptButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(acceptButton);
            expect(acceptFriendRequestSpy).toHaveBeenCalledTimes(1);
        });
        test(`Should, on a successful response from the 'acceptFriendRequest'
         API function, invoke the 'onSuccessHandler' callback function`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            await act(async () => { await renderComponent(
                "Person 1",
                "",
                "",
                callback,
            ) });
            const acceptButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await act(async() => { await user.click(acceptButton) });
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
    describe("The 'Decline' button...", () => {
        test(`Should be present in the document by default`, async () => {
            await act(async () => { await renderComponent() });
            const declineButton = screen.getByRole("button", { name: "decline-friend-request-button" });
            expect(declineButton).toBeInTheDocument();
        });
        test(`Should not be present in the document after a successful response
         from the 'declineFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const declineButton = screen.getByRole("button", { name: "decline-friend-request-button" });
            await user.click(declineButton);
            expect(declineButton).not.toBeInTheDocument();
        });
        test(`Should not be present in the document after a successful response
         from the 'acceptFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const acceptButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(acceptButton);
            const declineButton = screen.queryByRole("button", { name: "decline-friend-request-button" });
            expect(declineButton).toBeNull();
        });
        test(`When clicked, should invoke the 'declineFriendRequest' API
         function`, async () => {
            const user = userEvent.setup();
            const declineFriendRequestSpy = vi.spyOn(declineFriendRequest, "default");
            await act(async () => { await renderComponent() });
            const declineButton = screen.getByRole("button", { name: "decline-friend-request-button" });
            await user.click(declineButton);
            expect(declineFriendRequestSpy).toHaveBeenCalledTimes(1);
        });
        test(`Should, on a successful response from the 'declineFriendRequest'
         API function, invoke the 'onSuccessHandler' callback function`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            await act(async () => { await renderComponent(
                "Person 1",
                "",
                "",
                callback,
            ) });
            const declineButton = screen.getByRole("button", { name: "decline-friend-request-button" });
            await act(async() => { await user.click(declineButton) });
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
    describe("The response message...", () => {
        test(`Should not be present in the document by default`, async () => {
            await act(async () => { await renderComponent() });
            const responseMessage = screen.queryByLabelText("response-message");
            expect(responseMessage).toBeNull();
         });
    });
    describe("The response message...", () => {
        test(`Should be present in the document after a successful response from
         the 'acceptFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const acceptButton = screen.getByRole("button", { name: "accept-friend-request-button" });
            await user.click(acceptButton);
            const responseMessage = screen.getByLabelText("response-message");
            expect(responseMessage).toBeInTheDocument();
         });
    });
    describe("The response message...", () => {
        test(`Should be present in the document after a successful response from
         the 'declineFriendRequest' API function`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            const declineButton = screen.getByRole("button", { name: "decline-friend-request-button" });
            await user.click(declineButton);
            const responseMessage = screen.getByLabelText("response-message");
            expect(responseMessage).toBeInTheDocument();
         });
    });
});