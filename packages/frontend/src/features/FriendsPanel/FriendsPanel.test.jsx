/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import FriendsPanel from './index.jsx'

import * as getFriendsList from "@/utils/getFriendsList.js";
import * as getFriendRequests from "./utils/getFriendRequests.js";

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

const renderComponent = async (
    defaultList = "friends",
    addingFriendDefault = false,
) => {
    act(() => render(<FriendsPanel
        defaultList={defaultList}
        addingFriendDefault={addingFriendDefault}
    />));
}

vi.mock('@/components/OptionButton', () => ({ 
    default: ({
        text,
        label,
        tooltipText,
        tooltipPosition,
        widthPx,
        heightPx,
        fontSizePx,
        borderType,
        onClickHandler,
    }) => {
        return (
            <button
                aria-label={label}
                onClick={() => onClickHandler()}
            ></button>
        );
    }
}));

vi.mock('./components/Friend', () => ({
    default: ({
        username,
        tagLine,
        status,
        imageSrc,
        imageAlt,
        onClickHandler,
    }) => {
        return (<></>);
    }
}));

vi.mock('./components/FriendRequest', () => ({ 
    default: ({
        username,
        profileImage,
        onSuccessHandler,
    }) => {
        return (
            <button
                aria-label="friend-request-mock-success-button"
                onClick={() => onSuccessHandler()}
            ></button>
        );
    }
}));

vi.mock('./components/AddFriendPanel', () => ({ 
    default: ({
        onCloseHandler,
        onSuccessHandler,
    }) => {
        return (
            <div
                aria-label="add-friend-panel-mock"
            >
                <button
                    aria-label="add-friend-panel-mock-close-button"
                    onClick={() => onCloseHandler()}
                ></button>
                <button
                    aria-label="add-friend-panel-mock-success-button"
                    onClick={() => onSuccessHandler("Friend 4")}
                ></button>
            </div>
        );
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
                profileImage: {
                    img: {
                        data: {
                            data: [],
                        }
                    }
                },
            },
            status: "online",
            imageSrc: "",
            imageAlt: "",
        },
    },
    {
        user: {
            _id: 1,
            username: "Friend 2",
            preferences: {
                displayName: "",
                tagLine: "Friend 2 tagline",
                profileImage: {
                    img: {
                        data: {
                            data: [],
                        }
                    }
                },
            },
            status: "online",
            imageSrc: "",
            imageAlt: "",
        },
    },
    {
        user: {
            _id: 2,
            username: "Friend 3",
            preferences: {
                displayName: "Friend 3",
                tagLine: "Friend 3 tagline",
                profileImage: {
                    img: {
                        data: {
                            data: [],
                        }
                    }
                },
            },
            status: "online",
            imageSrc: "",
            imageAlt: "",
        },
    },
]
const getFriendsListMock = vi.fn(() => {
    return {
        status: 200,
        message: "Found",
        friends: friendsList,
    }
});
vi.mock('@/utils/getFriendsList', async () => ({
    default: () => getFriendsListMock(),
}));

const friendRequests = [
    {
        _id: 3,
        username: "Friend 4",
        preferences: {
            profileImage: {
                img: {
                    data: {
                        data: [],
                    }
                }
            },
        },
    },
    {
        _id: 4,
        username: "Friend 5",
        preferences: {
            profileImage: {
                img: {
                    data: {
                        data: [],
                    }
                }
            },
        },
    },
    {
        _id: 5,
        username: "Friend 6",
        preferences: {
            profileImage: {
                img: {
                    data: {
                        data: [],
                    }
                }
            },
        },
    },
];
const getFriendRequestsMock = vi.fn(() => {
    return {
        status: 200,
        message: "Found",
        friendRequests: friendRequests,
    }
});
vi.mock('./utils/getFriendRequests', async () => ({
    default: () => getFriendRequestsMock(),
}));

describe("UI/DOM Testing...", () => {
    describe("The friends panel...", () => {
        test(`Should contain a heading element for the title`, async () => {
            await act(async () => { await renderComponent() });
            const friendsPanelTitle = screen.getByRole("heading", { name: "friends-panel-title" });
            expect(friendsPanelTitle).toBeInTheDocument();
        });
    });
    describe("The 'Add Friend' button...", () => {
        test(`Should be present in the document`, async () => {
            await act(async () => { await renderComponent() });
            const addFriendButton = screen.getByRole("button", { name: "add-friend-button" });
            expect(addFriendButton).toBeInTheDocument();
        });
        test(`When clicked, should open/close the 'AddFriendPanel' component`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent("friends", false); });

            const addFriendPanelBefore = screen.queryByRole("generic", { name: "add-friend-panel-mock" });
            expect(addFriendPanelBefore).toBeNull();

            const addFriendButton = screen.getByRole("button", { name: "add-friend-button" });
            await user.click(addFriendButton);

            const addFriendPanelAfter = screen.getByRole("generic", { name: "add-friend-panel-mock" });
            expect(addFriendPanelAfter).toBeInTheDocument();
        });
    });
    describe("The 'View Friend Requests'/'View Friends' button...", () => {
        test(`Should be present in the document`, async () => {
            await act(async () => { await renderComponent() });
            const listViewingButton = screen.getByRole("button", { name: "list-viewing-button" });
            expect(listViewingButton).toBeInTheDocument();
        });
        test(`When clicked, should toggle the list being viewed between
         'friends' and 'requests'`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent("friends") });
            let friendsList;
            let friendRequestsList;
            const listViewingButton = screen.getByRole("button", { name: "list-viewing-button" });

            friendsList = screen.getByRole("list", { name: "friends-list" });
            expect(friendsList).toBeInTheDocument();
            friendRequestsList = screen.queryByRole("list", { name: "friend-requests-list" });
            expect(friendRequestsList).toBeNull();

            await user.click(listViewingButton);

            friendsList = screen.queryByRole("list", { name: "friends-list" });
            expect(friendsList).toBeNull();
            friendRequestsList = screen.getByRole("list", { name: "friend-requests-list" });
            expect(friendRequestsList).toBeInTheDocument();

            await user.click(listViewingButton);

            friendsList = screen.getByRole("list", { name: "friends-list" });
            expect(friendsList).toBeInTheDocument();
            friendRequestsList = screen.queryByRole("list", { name: "friend-requests-list" });
            expect(friendRequestsList).toBeNull();
        });
    });
    describe("The friends list...", () => {
        test(`Should be present in the document if the 'defaultList' prop value
         is equal to "friends"`, async () => {
            await act(async () => { await renderComponent("friends") });
            const friendsList = screen.getByRole("list", { name: "friends-list" });
            expect(friendsList).toBeInTheDocument();
        });
        test(`Should be present in the document if the 'defaultList' prop value
         is equal to "requests"`, async () => {
            await act(async () => { await renderComponent("requests") });
            const friendsList = screen.queryByRole("list", { name: "friends-list" });
            expect(friendsList).toBeNull();
        });
        test(`Should have as many 'Friend' component children as there are
         friends returned by the 'getFriendsList' API function`, async () => {
            await act(async () => { await renderComponent("friends") });
            const friends = screen.getAllByRole("listitem", { name: "friend" });
            expect(friends.length).toBe(friendsList.length);
        });
    });
    describe("The friend requests list...", () => {
        test(`Should be present in the document if the 'defaultList' prop value
            is equal to "requests"`, async () => {
            await act(async () => { await renderComponent("requests") });
            const friendRequestsList = screen.getByRole("list", { name: "friend-requests-list" });
            expect(friendRequestsList).toBeInTheDocument();
        });
        test(`Should be present in the document if the 'defaultList' prop value
            is equal to "friends"`, async () => {
            await act(async () => { await renderComponent("friends") });
            const friendRequestsList = screen.queryByRole("list", { name: "friend-requests-list" });
            expect(friendRequestsList).toBeNull();
        });
        test(`Should have as many 'FriendRequest' component children as there are
         friends returned by the 'getFriendRequests' API function`, async () => {
            await act(async () => { await renderComponent("requests") });
            const friendRequestOptions = screen.getAllByRole("listitem", { name: "friend-request" });
            expect(friendRequestOptions.length).toBe(friendRequests.length);
        });
    });
    describe("The friend request options...", () => {
        test(`Should, when their 'onSuccessHandler' callback functions are
         invoked, be removed from the friend requests list`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent("requests") });
            const friendRequestOptionsBefore = screen.getAllByRole("listitem", { name: "friend-request" });
            expect(friendRequestOptionsBefore.length).toBe(friendRequests.length);
            const friendRequestSuccessButtons = screen.getAllByRole("button", { name: "friend-request-mock-success-button" });
            await user.click(friendRequestSuccessButtons[0]);
            const friendRequestOptionsAfter = screen.getAllByRole("listitem", { name: "friend-request" });
            expect(friendRequestOptionsAfter.length).toBe(friendRequests.length - 1);
        });
    });
    describe("The 'Load More' button...", () => {
        test(`Should be present in the document`, async () => {
            await act(async () => { await renderComponent() });
            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            expect(loadMoreButton).toBeInTheDocument();
        });
        test(`Should, when clicked, attempt to append more friends to the end of
         the friends list (when the list currently being viewed is "friends")`, async () => {
            const getFriendsListSpy = vi.spyOn(getFriendsList, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent("friends") });
            getFriendsListMock.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friends: [],
            });
            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            fireEvent.mouseLeave(loadMoreButton);
            await user.click(loadMoreButton);
            expect(getFriendsListSpy).toHaveBeenCalled(2);
        });
        test(`Should, when clicked, attempt to append more friends to the end of
         the friends list (when the list currently being viewed is "friends")`, async () => {
            const getFriendRequestsSpy = vi.spyOn(getFriendRequests, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent("requests") });
            getFriendRequestsMock.mockReturnValueOnce({
                status: 200,
                message: "Found",
                friendRequests: [],
            });
            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            fireEvent.mouseLeave(loadMoreButton);
            await user.click(loadMoreButton);
            expect(getFriendRequestsSpy).toHaveBeenCalled(2);
        });
    });
    describe("The 'AddFriendPanel' component...", () => {
        test(`Should be present in the document if the 'addingFriendDefault'
         prop value is equal to 'true'`, async () => {
            await act(async () => { await renderComponent("friends", true) });
            const addFriendPanel = screen.getByRole("generic", { name: "add-friend-panel-mock" });
            expect(addFriendPanel).toBeInTheDocument();
        });
        test(`Should not be present in the document if the 'addingFriendDefault'
         prop value is equal to 'false'`, async () => {
            await act(async () => { await renderComponent("friends", false) });
            const addFriendPanel = screen.queryByRole("generic", { name: "add-friend-panel-mock" });
            expect(addFriendPanel).toBeNull();
        });
        test(`Should remove a user from the friend requests list if it is on
         that list and the panels 'onSuccessHandler' callback function is
         invoked`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent("requests", true) });
            const friendRequestOptionsBefore = screen.getAllByRole("listitem", { name: "friend-request" });
            expect(friendRequestOptionsBefore.length).toBe(friendRequests.length);
            const addFriendPanelSuccessButton = screen.getByRole("button", { name: "add-friend-panel-mock-success-button" });
            await user.click(addFriendPanelSuccessButton);
            const friendRequestOptionsAfter = screen.getAllByRole("listitem", { name: "friend-request" });
            expect(friendRequestOptionsAfter.length).toBe(friendRequests.length - 1);
        });
    });
});