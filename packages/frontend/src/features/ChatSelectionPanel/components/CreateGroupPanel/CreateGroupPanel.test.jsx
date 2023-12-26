/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import CreateGroupPanel from './index.jsx'

const renderComponent = async (
    onCloseHandler = () => {},
    createGroupHandler = () => {},
    createGroupSubmissionErrors = [],
) => { await act(async () => render(
    <CreateGroupPanel
        onCloseHandler={onCloseHandler}
        createGroupHandler={createGroupHandler}
        createGroupSubmissionErrors={createGroupSubmissionErrors}
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
vi.mock('../../utils/getFriendsList', async () => ({
    default: () => getFriendsList(),
}));

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the title...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const title = screen.getByRole("heading", { name: "create-group-panel" });
            expect(title).toBeInTheDocument();
        });
    });
    describe("The list element displaying the friends being added to the group...", () => {
        test(`Should not be present in the document if no friends are currently
         being added to the group`, async () => {
            await renderComponent();
            const friendsAddingList = screen.queryByRole("list", { name: "friends-adding-list" });
            expect(friendsAddingList).toBeNull();
        });
        test(`Should be present in the document if there is at least one friend
         currently being added to the group`, async () => {
            const user = userEvent.setup();
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
            const addToGroupButton = screen.getByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButton);
            const friendsAddingList = screen.getByRole("list", { name: "friends-adding-list" });
            expect(friendsAddingList).toBeInTheDocument();
        });
        test(`Should contain any friends that have been added to the list of
         friends that will be in the new group`, async () => {
            const user = userEvent.setup();
            await renderComponent();
            const addToGroupButtons = screen.getAllByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButtons[0]);
            await user.click(addToGroupButtons[1]);
            await user.click(addToGroupButtons[2]);
            const friendsAdding = screen.getAllByRole("listitem", { name: "friend-adding" });
            expect(friendsAdding.length).toBe(3);
        });
    });
    describe("The information element for each friend being added to the group...", () => {
        test(`Should be present in the document if the friend is currently being
         added to the group`, async () => {
            const user = userEvent.setup();
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
            const addToGroupButton = screen.getByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButton);
            const friendAdding = screen.getByRole("listitem", { name: "friend-adding" });
            expect(friendAdding).toBeInTheDocument();
        });
        test("Should display a name", async () => {
            const user = userEvent.setup();
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
            const addToGroupButton = screen.getByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButton);
            const friendAddingName = screen.getByRole("heading", { name: "friend-adding-name" });
            expect(friendAddingName.textContent).toBe("Person 1");
        });
        test("Should display a 'Remove' button", async () => {
            const user = userEvent.setup();
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
            const addToGroupButton = screen.getByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButton);
            const removeFromGroupButton = screen.getByRole("button", { name: "remove-from-group-button" });
            expect(removeFromGroupButton).toBeInTheDocument();
        });
        test(`That, when clicked, should remove the friend from the list of
         friends being added to the group`, async () => {
            const user = userEvent.setup();
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
            const addToGroupButton = screen.getByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButton);
            const removeFromGroupButton = screen.getByRole("button", { name: "remove-from-group-button" });
            await user.click(removeFromGroupButton);
            const friendAdding = screen.queryByRole("listitem", { name: "friend-adding" });
            expect(friendAdding).toBeNull();
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
        test(`Should not contain any friends that have already been added to the
         list of friends that will be in the new group`, async () => {
            const user = userEvent.setup();
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
            const friend = screen.getByRole("listitem", { name: "friend" });
            expect(friend).toBeInTheDocument();
            const addToGroupButton = screen.getByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButton);
            expect(friend).not.toBeInTheDocument();
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
            const friendName = screen.getByRole("heading", { name: "friend-name" });
            expect(friendName.textContent).toBe("Person 1");
        });
        test("Should display an 'Add to Group' button", async () => {
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
            const addToGroupButton = screen.getByRole("button", { name: "add-to-group-button" });
            expect(addToGroupButton).toBeInTheDocument();
        });
        test(`That, when clicked, should add the friend to the list of friends
         being added to the group`, async () => {
            const user = userEvent.setup();
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
            const addToGroupButton = screen.getByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButton);
            const friendAdding = screen.getByRole("listitem", { name: "friend-adding" });
            expect(friendAdding).toBeInTheDocument();
        });
    });
    describe("The 'Create Group' button...", () => {
        test(`Should not be present in the document if there are currently no
         friends in the list of friends being added to the group`, async () => {
            await renderComponent();
            const createGroupButton = screen.queryByRole("button", { name: "create-group-button" });
            expect(createGroupButton).toBeNull();
        });
        test(`Should be present in the document if there is at least one friend
         in the list of friends being added to the group`, async () => {
            const user = userEvent.setup();
            await renderComponent();
            const addToGroupButtons = screen.getAllByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButtons[0]);
            const createGroupButton = screen.getByRole("button", { name: "create-group-button" });
            expect(createGroupButton).toBeInTheDocument();
        });
        test(`Should, when clicked, invoke the callback function specified in
         the 'createGroupHandler' prop`, async () => {
            const user = userEvent.setup();
            const callback = vi.fn();
            await renderComponent(
                () => {},
                callback,
                [],
            );
            await renderComponent();
            const addToGroupButtons = screen.getAllByRole("button", { name: "add-to-group-button" });
            await user.click(addToGroupButtons[0]);
            const createGroupButton = screen.getByRole("button", { name: "create-group-button" });
            await user.click(createGroupButton);
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
    describe("The submission errors list title...", () => {
        test(`Should not be present in the document if there are no errors`, async () => {
            renderComponent();
            const submissionErrorsList = screen.queryByRole("heading", { name: "create-group-submission-errors-title" });
            expect(submissionErrorsList).toBeNull();
        });
        test(`Should be present in the document if there are errors`, async () => {
            await act(() => renderComponent(
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.queryByRole("heading", { name: "create-group-submission-errors-title" });
            expect(submissionErrorsList).toBeInTheDocument();
        });
    });
    describe("The submission errors list...", () => {
        test(`Should not be present in the document if there are no errors`, async () => {
            renderComponent();
            const submissionErrorsList = screen.queryByRole("list", { name: "create-group-submission-errors-list" });
            expect(submissionErrorsList).toBeNull();
        });
        test(`Should be present in the document if there are errors`, async () => {
            await act(() => renderComponent(
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.getByRole("list", { name: "create-group-submission-errors-list" });
            expect(submissionErrorsList).toBeInTheDocument();
        });
        test(`Should have a number of list item children equivalent to the
         number of errors`, async () => {
            await act(() => renderComponent(
                () => {},
                () => {},
                ["error_1", "error_2", "error_3"],
            ));
            const submissionErrorsList = screen.getAllByRole("listitem", { name: "create-group-submission-error-item" });
            expect(submissionErrorsList.length).toBe(3);
        });
    });
});
