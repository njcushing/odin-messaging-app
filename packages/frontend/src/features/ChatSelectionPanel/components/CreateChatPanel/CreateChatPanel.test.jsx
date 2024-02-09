/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import CreateChatPanel from './index.jsx'

const renderComponent = async (
    onCloseHandler = () => {},
    createChatHandler = () => {},
    createChatSubmissionErrors = [],
) => { await act(async () => render(
    <CreateChatPanel
        onCloseHandler={onCloseHandler}
        createChatHandler={createChatHandler}
        createChatSubmissionErrors={createChatSubmissionErrors}
    />
)); }

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

vi.mock('@/components/ProfileImage', () => ({ 
    default: ({
        src,
        alt,
        sizePx,
    }) => {
        return (<div aria-label="profile-image"></div>);
    }
}));

const mockFriendsList = [
    {
        _id: "1",
        name: "Person 1",
        tagLine: "Person 1 tagline",
        imageSrc: "",
        imageAlt: "",
    },
    {
        _id: "2",
        name: "Person 2",
        tagLine: "Person 2 tagline",
        imageSrc: "",
        imageAlt: "",
    },
    {
        _id: "3",
        name: "Person 3",
        tagLine: "Person 3 tagline",
        imageSrc: "",
        imageAlt: "",
    },
];
const getFriendsList = vi.fn(() => mockFriendsList);
vi.mock('./utils/getFriendsList', async () => ({
    default: () => getFriendsList(),
}));

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the title...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const title = screen.getByRole("heading", { name: "create-chat-panel" });
            expect(title).toBeInTheDocument();
        });
    });
    describe("The 'No friends' message...", () => {
        test(`Should be present in the document if no friends are returned by
         the 'getFriendsList' function`, async () => {
            getFriendsList.mockReturnValueOnce([]);
            await renderComponent();
            const noFriendsMessage = screen.getByRole("heading", { name: "no-friends" });
            expect(noFriendsMessage).toBeInTheDocument();
        });
        test(`Should not be present in the document if friends are returned by
         the 'getFriendsList' function`, async () => {
            await renderComponent();
            const noFriendsMessage = screen.queryByRole("heading", { name: "no-friends" });
            expect(noFriendsMessage).toBeNull();
        });
    });
    describe("The list element displaying the friends...", () => {
        test(`Should be present in the document if friends are returned by the
         'getFriendsList' function`, async () => {
            await renderComponent();
            const friendsList = screen.getByRole("list", { name: "friends-list" });
            expect(friendsList).toBeInTheDocument();
        });
        test(`Should not be present in the document if no friends are returned
         by the 'getFriendsList' function`, async () => {
            getFriendsList.mockReturnValueOnce([]);
            await renderComponent();
            const friendsList = screen.queryByRole("list", { name: "friends-list" });
            expect(friendsList).toBeNull();
        });
    });
    describe("The information element for each friend...", () => {
        test(`Should be present in the document if friends are returned by the
         'getFriendsList' function`, async () => {
            await renderComponent();
            const friends = screen.getAllByRole("listitem", { name: "friend" });
            expect(friends.length).toBe(mockFriendsList.length);
        });
        test("Should display a profile image", async () => {
            getFriendsList.mockReturnValueOnce([
                {
                    _id: "1",
                    name: "Person 1",
                    tagLine: "Person 1 tagline",
                    imageSrc: "",
                    imageAlt: "",
                },
            ]);
            await renderComponent();
            const friendProfileImage = screen.getByRole("generic", { name: "profile-image" });
            expect(friendProfileImage).toBeInTheDocument();
        });
        test("Should display a name", async () => {
            getFriendsList.mockReturnValueOnce([
                {
                    _id: "1",
                    name: "Person 1",
                    tagLine: "Person 1 tagline",
                    imageSrc: "",
                    imageAlt: "",
                },
            ]);
            await renderComponent();
            const friendName = screen.getByText("Person 1");
            expect(friendName).toBeInTheDocument();
        });
        test("Should display a 'Create Chat' button", async () => {
            getFriendsList.mockReturnValueOnce([
                {
                    _id: "1",
                    name: "Person 1",
                    tagLine: "Person 1 tagline",
                    imageSrc: "",
                    imageAlt: "",
                },
            ]);
            await renderComponent();
            const createChatButton = screen.getByRole("button", { name: "create-chat-button" });
            expect(createChatButton).toBeInTheDocument();
        });
        test(`Which, when clicked, should invoke the callback function specified
         in the 'addFriendHandler' prop`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            getFriendsList.mockReturnValueOnce([
                {
                    _id: "1",
                    name: "Person 1",
                    tagLine: "Person 1 tagline",
                    imageSrc: "",
                    imageAlt: "",
                },
            ]);
            await renderComponent(
                () => {},
                callback,
                [],
            );
            const createChatButton = screen.getByRole("button", { name: "create-chat-button" });
            await user.click(createChatButton);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
    describe("The submission errors list title...", () => {
        test(`Should not be present in the document if there are no errors`, async () => {
            renderComponent();
            const submissionErrorsList = screen.queryByRole("heading", { name: "create-chat-submission-errors-title" });
            expect(submissionErrorsList).toBeNull();
        });
        test(`Should be present in the document if there are errors`, async () => {
            await act(() => renderComponent(
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.queryByRole("heading", { name: "create-chat-submission-errors-title" });
            expect(submissionErrorsList).toBeInTheDocument();
        });
    });
    describe("The submission errors list...", () => {
        test(`Should not be present in the document if there are no errors`, async () => {
            renderComponent();
            const submissionErrorsList = screen.queryByRole("list", { name: "create-chat-submission-errors-list" });
            expect(submissionErrorsList).toBeNull();
        });
        test(`Should be present in the document if there are errors`, async () => {
            await act(() => renderComponent(
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.getByRole("list", { name: "create-chat-submission-errors-list" });
            expect(submissionErrorsList).toBeInTheDocument();
        });
        test(`Should have a number of list item children equivalent to the
         number of errors`, async () => {
            await act(() => renderComponent(
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.getAllByRole("listitem", { name: "create-chat-submission-error-item" });
            expect(submissionErrorsList.length).toBe(3);
        });
    });
});
