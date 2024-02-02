/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import FriendSelectorPanel from './index.jsx'

const renderComponent = async (
    title = "Title",
    removeButtonText = "Remove",
    addButtonText = "Add",
    submitButtonText = "Submit",
    noFriendsText = "No friends found.",
    onCloseHandler = () => {},
    onSubmitHandler = () => {},
    submissionErrors = [],
) => {
    await act(async () => render(<FriendSelectorPanel
        title={title}
        removeButtonText={removeButtonText}
        addButtonText={addButtonText}
        submitButtonText={submitButtonText}
        noFriendsText={noFriendsText}
        onCloseHandler={onCloseHandler}
        onSubmitHandler={onSubmitHandler}
        submissionErrors={submissionErrors}
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
        status,
        sizePx,
    }) => {
        return (<div aria-label="profile-image"></div>);
    }
}));

const friendsList = [
    {
        user: {
            _id: 0,
            username: "Friend 1",
            preferences: {
                displayName: "Friend 1",
                tagLine: "Friend 1 tagline",
            },
            status: "online",
            imageSrc: "",
            imageAlt: "",
        }
    },
    {
        user: {
            _id: 1,
            username: "Friend 2",
            preferences: {
                displayName: "",
                tagLine: "Friend 2 tagline",
            },
            status: "online",
            imageSrc: "",
            imageAlt: "",
        }
    },
    {
        user: {
            _id: 2,
            username: "Friend 3",
            preferences: {
                displayName: "",
                tagLine: "Friend 3 tagline",
            },
            status: "online",
            imageSrc: "",
            imageAlt: "",
        }
    },
];
const getFriendsList = vi.fn(() => {
    return {
        status: 200,
        message: "Found",
        friends: friendsList,
    }
});
vi.mock('@/utils/getFriendsList', async () => ({
    default: () => getFriendsList(),
}));

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the title...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const title = screen.getByRole("heading", { name: "friend-selector-panel" });
            expect(title).toBeInTheDocument();
        });
    });
    describe("The list element displaying the friends selected...", () => {
        test(`Should not be present in the document if no friends are currently
         selected`, async () => {
            await renderComponent();
            const friendsSelectedList = screen.queryByRole("list", { name: "friends-selected-list" });
            expect(friendsSelectedList).toBeNull();
        });
        test(`Should be present in the document if there is at least one friend
         selected`, async () => {
            const user = userEvent.setup();
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const addButton = screen.getByRole("button", { name: "add-button" });
            await user.click(addButton);
            const friendsSelectedList = screen.getByRole("list", { name: "friends-selected-list" });
            expect(friendsSelectedList).toBeInTheDocument();
        });
        test(`Should contain any friends that have been added to the list of
         friends that will be in the new group`, async () => {
            const user = userEvent.setup();
            await renderComponent();
            const addButtons = screen.getAllByRole("button", { name: "add-button" });
            await user.click(addButtons[0]);
            await user.click(addButtons[1]);
            await user.click(addButtons[2]);
            const friendsAdding = screen.getAllByRole("listitem", { name: "friend-selected" });
            expect(friendsAdding.length).toBe(3);
        });
    });
    describe("The information element for each friend being added to the group...", () => {
        test(`Should be present in the document if the friend is currently being
         added to the group`, async () => {
            const user = userEvent.setup();
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const addButton = screen.getByRole("button", { name: "add-button" });
            await user.click(addButton);
            const friendSelected = screen.getByRole("listitem", { name: "friend-selected" });
            expect(friendSelected).toBeInTheDocument();
        });
        test("Should display a name", async () => {
            const user = userEvent.setup();
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[1]],
            });
            await renderComponent();
            const addButton = screen.getByRole("button", { name: "add-button" });
            await user.click(addButton);
            const friendSelectedName = screen.getByRole("heading", { name: "friend-selected-name" });
        });
        test("Should display a 'Remove' button", async () => {
            const user = userEvent.setup();
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const addButton = screen.getByRole("button", { name: "add-button" });
            await user.click(addButton);
            const removeButton = screen.getByRole("button", { name: "remove-button" });
            expect(removeButton).toBeInTheDocument();
        });
        test(`That, when clicked, should remove the friend from the list of
         friends being added to the group`, async () => {
            const user = userEvent.setup();
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const addButton = screen.getByRole("button", { name: "add-button" });
            await user.click(addButton);
            const removeButton = screen.getByRole("button", { name: "remove-button" });
            fireEvent.mouseLeave(removeButton);
            await user.click(removeButton);
            const friendSelected = screen.queryByRole("listitem", { name: "friend-selected" });
            expect(friendSelected).toBeNull();
        });
    });
    describe("The 'No friends' message...", () => {
        test(`Should be present in the document if no friends are returned by
         the 'getFriendsList' function`, async () => {
            getFriendsList.mockReturnValueOnce({
                status: 404,
                message: "Not found",
                friends: [],
            });
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
            getFriendsList.mockReturnValueOnce({
                status: 404,
                message: "Not found",
                friends: [],
            });
            await renderComponent();
            const friendsList = screen.queryByRole("list", { name: "friends-list" });
            expect(friendsList).toBeNull();
        });
        test(`Should not contain any friends that have already been added to the
         list of friends that will be in the new group`, async () => {
            const user = userEvent.setup();
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const friend = screen.getByRole("listitem", { name: "friend" });
            expect(friend).toBeInTheDocument();
            const addButton = screen.getByRole("button", { name: "add-button" });
            await user.click(addButton);
            expect(friend).not.toBeInTheDocument();
        });
    });
    describe("The 'Load More' button...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            expect(loadMoreButton).toBeInTheDocument();
        });
        test(`Should, when clicked, attempt to append more friends to the end
         of the friends list`, async () => {
            const user = userEvent.setup();
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            }).mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[1]],
            });
            await renderComponent();
            const friendsBefore = screen.getAllByRole("listitem", { name: "friend" });
            expect(friendsBefore.length).toBe(1);
            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            fireEvent.mouseLeave(loadMoreButton);
            await user.click(loadMoreButton);
            const friendsAfter = screen.getAllByRole("listitem", { name: "friend" });
            expect(friendsAfter.length).toBe(2);
        });
    });
    describe("The information element for each friend...", () => {
        test(`Should be present in the document if friends are returned by the
         'getFriendsList' function`, async () => {
            await renderComponent();
            const friends = screen.getAllByRole("listitem", { name: "friend" });
            expect(friends.length).toBe(friendsList.length);
        });
        test("Should display a profile image", async () => {
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const friendProfileImage = screen.getByRole("generic", { name: "profile-image" });
            expect(friendProfileImage).toBeInTheDocument();
        });
        test("Should display a name", async () => {
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const friendName = screen.getByRole("heading", { name: "friend-name" });
        });
        test("Should display an 'Add' button", async () => {
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const addButton = screen.getByRole("button", { name: "add-button" });
            expect(addButton).toBeInTheDocument();
        });
        test(`That, when clicked, should add the friend to the list of friends
         being added to the group`, async () => {
            const user = userEvent.setup();
            getFriendsList.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [friendsList[0]],
            });
            await renderComponent();
            const addButton = screen.getByRole("button", { name: "add-button" });
            fireEvent.mouseLeave(addButton);
            await user.click(addButton);
            const friendSelected = screen.getByRole("listitem", { name: "friend-selected" });
            expect(friendSelected).toBeInTheDocument();
        });
    });
    describe("The 'Submit' button...", () => {
        test(`Should not be present in the document if there are currently no
         friends in the list of friends being added to the group`, async () => {
            await renderComponent();
            const submitButton = screen.queryByRole("button", { name: "submit-button" });
            expect(submitButton).toBeNull();
        });
        test(`Should be present in the document if there is at least one friend
         in the list of friends being added to the group`, async () => {
            const user = userEvent.setup();
            await renderComponent();
            const addButtons = screen.getAllByRole("button", { name: "add-button" });
            await user.click(addButtons[0]);
            const submitButton = screen.getByRole("button", { name: "submit-button" });
            expect(submitButton).toBeInTheDocument();
        });
        test(`Should, when clicked, invoke the callback function specified in
         the 'submitHandler' prop`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            await renderComponent(
                "Title",
                "Remove",
                "Add",
                "Submit",
                "No friends found.",
                () => {},
                callback,
                [],
            );
            await renderComponent();
            const addButtons = screen.getAllByRole("button", { name: "add-button" });
            await user.click(addButtons[0]);
            const submitButton = screen.getByRole("button", { name: "submit-button" });
            fireEvent.mouseLeave(submitButton);
            await user.click(submitButton);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
    describe("The submission errors list title...", () => {
        test(`Should not be present in the document if there are no errors`, async () => {
            await act(async () => renderComponent());
            const submissionErrorsList = screen.queryByRole("heading", { name: "submission-errors-title" });
            expect(submissionErrorsList).toBeNull();
        });
        test(`Should be present in the document if there are errors`, async () => {
            await act(async () => renderComponent(
                "Title",
                "Remove",
                "Add",
                "Submit",
                "No friends found.",
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.getByRole("heading", { name: "submission-errors-title" });
            expect(submissionErrorsList).toBeInTheDocument();
        });
    });
    describe("The submission errors list...", () => {
        test(`Should not be present in the document if there are no errors`, async () => {
            await act(async () => renderComponent());
            const submissionErrorsList = screen.queryByRole("list", { name: "submission-errors-list" });
            expect(submissionErrorsList).toBeNull();
        });
        test(`Should be present in the document if there are errors`, async () => {
            await act(async () => renderComponent(
                "Title",
                "Remove",
                "Add",
                "Submit",
                "No friends found.",
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.getByRole("list", { name: "submission-errors-list" });
            expect(submissionErrorsList).toBeInTheDocument();
        });
        test(`Should have a number of list item children equivalent to the
         number of errors`, async () => {
            await act(async () => renderComponent(
                "Title",
                "Remove",
                "Add",
                "Submit",
                "No friends found.",
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.getAllByRole("listitem", { name: "submission-error-item" });
            expect(submissionErrorsList.length).toBe(3);
        });
    });
});
