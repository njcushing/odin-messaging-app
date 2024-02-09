/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import ChatPanel from './index.jsx'

import mongoose from "mongoose";

import * as getChat from "./utils/getChat";
import * as combineParticipantNames from "../../utils/combineParticipantNames";
import * as addFriendsToChat from "./utils/addFriendsToChat";
import * as updateChatImage from "./utils/updateChatImage";
import * as sendMessage from "./utils/sendMessage.js";
import * as extractImage from "@/utils/extractImage";
import * as validateChat from "../../../../../../../utils/validateChatFields.js";
import * as validateMessage from "../../../../../../../utils/validateMessageFields.js";

// For 'Not implemented: navigation' error 
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };
afterEach(() => { assignMock.mockClear(); });

const userIdDefined = new mongoose.Types.ObjectId();

const renderComponent = async (
    chatId = new mongoose.Types.ObjectId(),
    userId = userIdDefined,
    messageSentHandler = () => {},
    addedFriendsHandler = () => {},
    updatedChatImageHandler = () => {},
) => {
    act(() => render(<ChatPanel
        chatId={chatId}
        userId={userId}
        messageSentHandler={messageSentHandler}
        addedFriendsHandler={addedFriendsHandler}
        updatedChatImageHandler={updatedChatImageHandler}
    />));
}

vi.mock('@/components/ProfileImage', () => ({ 
    default: ({
        src,
        alt,
        status,
        sizePx,
    }) => {
        return (<></>);
    }
}));

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

vi.mock('@/components/FieldUpdater', () => ({ 
    default: ({
        labelText,
        fieldName,
        initialValue,
        validator,
        apiFunction,
        context,
        onUpdateHandler,
    }) => {
        return (
            <div aria-label={labelText}>
                <button
                    aria-label="field-updater-mock-submit-button"
                    onClick={() => onUpdateHandler()}
                ></button>
            </div>
        );
    }
}));

vi.mock('../FriendSelectorPanel', () => ({ 
    default: ({
        title,
        removeButtonText,
        addButtonText,
        submitButtonText,
        noFriendsText,
        onCloseHandler,
        onSubmitHandler,
        submissionErrors,
    }) => {
        return (
            <div
                aria-label="friend-selector-panel-mock"
            >
                <button
                    aria-label="friend-selector-panel-mock-submit-button-valid"
                    onClick={() => onSubmitHandler([new mongoose.Types.ObjectId()])}
                ></button>
                <button
                    aria-label="friend-selector-panel-mock-submit-button-invalid"
                    onClick={() => onSubmitHandler([new mongoose.Types.ObjectId(), "invalidId"])}
                ></button>
                {title}
            </div> 
        );
    }
}));

vi.mock('./components/Message', () => ({ 
    default: ({
        text,
        image,
        name,
        dateSent,
        profileImage,
        position,
        replyingTo,
        onReplyToHandler,
    }) => {
        return (
            <button
                aria-label="message-mock-reply-to-button"
                onClick={() => onReplyToHandler()}
            >{text}</button> 
        );
    }
}));

vi.mock('./components/MessageBox', () => ({ 
    default: ({
        text,
        placeholder,
        submissionErrors,
        onSubmitHandler,
    }) => {
        return (
            <div aria-label="message-box-mock">
                <button
                    aria-label="message-box-mock-text-submit-button"
                    onClick={() => onSubmitHandler({
                        type: "text",
                        value: "message text",
                    })}
                ></button>
                <button
                    aria-label="message-box-mock-image-submit-button"
                    onClick={() => onSubmitHandler({
                        type: "image",
                        value: new Uint8Array(),
                    })}
                ></button>
            </div>
        );
    }
}));

const users = [
    {
        _id: userIdDefined,
        username: "Friend 1",
        preferences: {
            displayName: "Friend 1",
            tagLine: "Friend 1 tagline",
            profileImage: {
                img: {
                    data: {
                        data: new Uint8Array(),
                    },
                },
            },
        },
        status: "online",
        imageSrc: "",
        imageAlt: "",
    },
    {
        _id: 1,
        username: "Friend 2",
        preferences: {
            displayName: "Friend 2",
            tagLine: "Friend 2 tagline",
            profileImage: {
                img: {
                    data: {
                        data: new Uint8Array(),
                    },
                },
            },
        },
        status: "online",
        imageSrc: "",
        imageAlt: "",
    },
    {
        _id: 2,
        username: "Friend 3",
        preferences: {
            displayName: "",
            tagLine: "Friend 3 tagline",
            profileImage: null,
        },
        status: "online",
        imageSrc: "",
        imageAlt: "",
    },
    {
        _id: 3,
        username: "Unknown User",
        preferences: {
            displayName: "",
            tagLine: "Unknown User tagline",
        },
        status: "online",
        imageSrc: "",
        imageAlt: "",
    },
];

const participants = [
    {
        user: { ...users[0] },
        nickname: "friend1",
        role: "guest",
        muted: false,
    },
    {
        user: { ...users[1] },
        nickname: "",
        role: "guest",
        muted: false,
    },
    {
        user: { ...users[2] },
        nickname: "",
        role: "guest",
        muted: false,
    },
];
const messages = [
    {
        _id: 0,
        author: users[0]._id,
        text: "Message 1 text",
        image: {
            img: {
                data: {
                    data: new Uint8Array(),
                },
            },
        },
        replyingTo: null,
        deleted: false,
    },
    {
        _id: 1,
        author: users[1]._id,
        text: "Message 2 text",
        image: {
            img: {
                data: {
                    data: new Uint8Array(),
                },
            },
        },
        replyingTo: {
            _id: 0,
            author: users[0]._id,
            image: null,
            deleted: false,
        },
        deleted: false,
    },
    {
        _id: 2,
        author: users[2]._id,
        text: "Message 3 text",
        image: {
            img: {
                data: {
                    data: new Uint8Array(),
                },
            },
        },
        replyingTo: {
            _id: 0,
            author: users[0]._id,
            text: "Message 1 text",
            image: {
                img: {
                    data: {
                        data: new Uint8Array(),
                    },
                },
            },
            deleted: false,
        },
        deleted: false,
    },
    {
        _id: 3,
    },
];
const chat = {
    participants: participants,
    name: "",
    image: {
        img: {
            data: {
                data: new Uint8Array(),
            },
        },
    },
    messages: messages,
}
const getChatMock = vi.fn(() => {
    return {
        status: 200,
        message: "Chat found.",
        chat: chat,
    };
});
vi.mock('./utils/getChat', async () => ({
    default: () => getChatMock(),
}));

const addFriendsToChatMock = vi.fn(() => {
    return {
        status: 200,
        message: "Friends added to chat.",
        chatId: 0,
    };
});
vi.mock('./utils/addFriendsToChat', async () => ({
    default: () => addFriendsToChatMock(),
}));

const combineParticipantNamesMock = vi.fn(() => "Combined");
vi.mock('../../utils/combineParticipantNames', async () => ({
    default: () => combineParticipantNamesMock(),
}));

const validateMessageTextMock = vi.fn(() => ({
    status: true,
    message: "Valid Message Text.",
}));
const validateMessageImageMock = vi.fn(() => ({
    status: true,
    message: "Valid Message Image.",
}));
const validateMessageReplyingToMock = vi.fn(() => ({
    status: true,
    message: "Valid Message _id to reply to.",
}));
vi.mock('../../../../../../../utils/validateMessageFields.js', async () => {
    const actual = await vi.importActual("../../../../../../../utils/validateMessageFields.js");
    return {
        ...actual,
        text: () => validateMessageTextMock(),
        image: () => validateMessageImageMock(),
        replyingTo: () => validateMessageReplyingToMock(),
    }
});

const sendMessageTextMock = vi.fn(() => ({
    status: 200,
    message: "Text message sent successfully.",
    newMessage: { _id: new mongoose.Types.ObjectId },
}));
const sendMessageImageMock = vi.fn(() => ({
    status: 200,
    message: "Image message sent successfully.",
    newMessage: { _id: new mongoose.Types.ObjectId },
}));
vi.mock('./utils/sendMessage.js', async () => {
    const actual = await vi.importActual("./utils/sendMessage.js");
    return {
        ...actual,
        text: () => sendMessageTextMock(),
        image: () => sendMessageImageMock(),
    }
});

global.URL.createObjectURL = vi.fn(() => 'image');

describe(`Prop Testing...`, () => {
    describe(`The 'chatId' prop...`, () => {
        test(`Should cause the component to return an error if its value is not
         either a valid MongoDB ObjectId or a number (to allow 'null')`, async () => {
            const consoleErrorSpy = vi.spyOn(console, "error");
            consoleErrorSpy.mockReturnValueOnce(); // suppress console error
            await act(async () => { await renderComponent("") });
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockClear();

            await act(async () => { await renderComponent(null) });
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            consoleErrorSpy.mockClear();

            await act(async () => { await renderComponent() });
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });
    describe(`The 'userId' prop...`, () => {
        test(`Should cause the component to return an error if its value is not
         either a valid MongoDB ObjectId or a number (to allow 'null')`, async () => {
            const consoleErrorSpy = vi.spyOn(console, "error");
            consoleErrorSpy.mockReturnValueOnce(); // suppress console error
            await act(async () => { await renderComponent(new mongoose.Types.ObjectId(), "") });
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockClear();

            await act(async () => { await renderComponent(new mongoose.Types.ObjectId(), null) });
            expect(consoleErrorSpy).not.toHaveBeenCalled();

            consoleErrorSpy.mockClear();

            await act(async () => { await renderComponent() });
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });
});
describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the chat name...", () => {
        test(`Should not be present in the document if no custom chat name is
         set`, async () => {
            await act(async () => { await renderComponent() });
            const chatName = screen.queryByRole("heading", { name: "chat-name" });
            expect(chatName).toBeNull();
        });
        test(`Should be present in the document if a custom chat name is set`, async () => {
            getChatMock.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    name: "Custom Chat Name",
                },
            });
            await act(async () => { await renderComponent() });
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName).toBeInTheDocument();
        });
        test(`Should have textContent equal to the custom chat name`, async () => {
            getChatMock.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    name: "Custom Chat Name",
                },
            });
            await act(async () => { await renderComponent() });
            const chatName = screen.getByRole("heading", { name: "chat-name" });
            expect(chatName.textContent).toBe("Custom Chat Name");
        });
    });
    describe("The update chat image button...", () => {
        test(`Should be present in the document if the server has responded to
         the request in the 'getChat' API function with a valid chat`, async () => {
            await act(async () => { await renderComponent() });
            const toggleUpdateChatImageDisplayButton = screen.getByRole("button", { name: "toggle-update-chat-image-display" });
            expect(toggleUpdateChatImageDisplayButton).toBeInTheDocument();
        });
        test(`Otherwise, it should not be present in the document`, async () => {
            getChatMock.mockReturnValueOnce({
                status: 400,
                message: "Chat not found.",
                chat: null,
            })
            await act(async () => { await renderComponent() });
            const toggleUpdateChatImageDisplayButton = screen.queryByRole("button", { name: "toggle-update-chat-image-display" });
            expect(toggleUpdateChatImageDisplayButton).toBeNull();
        });
        test(`Should, when clicked, toggle the 'Update chat image' FieldUpdater
         component`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            let updateChatImage;
            const toggleUpdateChatImageDisplayButton = screen.getByRole("button", { name: "toggle-update-chat-image-display" });

            updateChatImage = screen.queryByRole("generic", { name: "update-chat-image" });
            expect(updateChatImage).toBeNull();

            fireEvent.mouseLeave(toggleUpdateChatImageDisplayButton);
            await user.click(toggleUpdateChatImageDisplayButton);

            updateChatImage = screen.getByRole("generic", { name: "update-chat-image" });
            expect(updateChatImage).toBeInTheDocument();

            await user.click(toggleUpdateChatImageDisplayButton);

            updateChatImage = screen.queryByRole("generic", { name: "update-chat-image" });
            expect(updateChatImage).toBeNull();
        });
    });
    describe("The 'Update chat image' FieldUpdater component...", () => {
        test(`Should invoke the 'getChat' API function if its 'onSubmitHandler'
         callback function is invoked`, async () => {
            const getChatSpy = vi.spyOn(getChat, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            getChatMock.mockReturnValueOnce({ // prevent duplicating messages
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    messages: [],
                },
            });

            const toggleUpdateChatImageDisplayButton = screen.getByRole("button", { name: "toggle-update-chat-image-display" });
            await user.click(toggleUpdateChatImageDisplayButton);

            const updateChatImageSubmitButton = screen.getByLabelText("Set a New Chat Image").children[0];
            await user.click(updateChatImageSubmitButton);

            expect(getChatSpy).toHaveBeenCalled();
        });
    });
    describe("The heading element displaying the participants' names...", () => {
        test(`Should not be present in the document if a custom chat name is
         set`, async () => {
            getChatMock.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    name: "Custom Chat Name",
                },
            });
            await act(async () => { await renderComponent() });
            const chatParticipants = screen.queryByRole("heading", { name: "chat-participants" });
            expect(chatParticipants).toBeNull();
        });
        test(`Should be present in the document if no custom chat name is set`, async () => {
            await act(async () => { await renderComponent() });
            const chatParticipants = screen.getByRole("heading", { name: "chat-participants" });
            expect(chatParticipants).toBeInTheDocument();
        });
        test(`Should have textContent equal to that returned by the
         'combineParticipantNames' function`, async () => {
            await act(async () => { await renderComponent() });
            const chatParticipants = screen.getByRole("heading", { name: "chat-participants" });
            expect(chatParticipants.textContent).toBe("Combined");
        });
    });
    describe("The list element displaying the chat options...", () => {
        test(`Should be present in the document if the server has responded to
         the request in the 'getChat' API function with a valid chat`, async () => {
            await act(async () => { await renderComponent() });
            const chatOptions = screen.getByRole("list", { name: "chat-options" });
            expect(chatOptions).toBeInTheDocument();
        });
    });
    describe("The 'Add Person' ChatOption component...", () => {
        test(`Should be present in the document if the server has responded to
         the request in the 'getChat' API function with a valid chat`, async () => {
            await act(async () => { await renderComponent() });
            const addFriendsToChatButton = screen.getByRole("button", { name: "add person" });
            expect(addFriendsToChatButton).toBeInTheDocument();
        });
        test(`Should, when clicked, toggle the 'Add Friends to Chat'
         FriendSelectorPanel component`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            let addFriendsToChatPanel;
            const addFriendsToChatButton = screen.getByRole("button", { name: "add person" });

            addFriendsToChatPanel = screen.queryByRole("generic", { name: "friend-selector-panel-mock" });
            expect(addFriendsToChatPanel).toBeNull();

            await user.click(addFriendsToChatButton);

            addFriendsToChatPanel = screen.getByRole("generic", { name: "friend-selector-panel-mock" });
            expect(addFriendsToChatPanel).toBeInTheDocument();

            await user.click(addFriendsToChatButton);

            addFriendsToChatPanel = screen.queryByRole("generic", { name: "friend-selector-panel-mock" });
            expect(addFriendsToChatPanel).toBeNull();
        });
    });
    describe("The 'Add Friends to Chat' FriendSelectorPanel component...", () => {
        test(`Should invoke the 'addFriendsToChat' API function if its
         'onSubmitHandler' callback function is invoked`, async () => {
            const addFriendsToChatSpy = vi.spyOn(addFriendsToChat, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const addFriendsToChatButton = screen.getByRole("button", { name: "add person" });
            await user.click(addFriendsToChatButton);

            const friendSelectorPanelSubmitButton = screen.getByRole("button", { name: "friend-selector-panel-mock-submit-button-valid" });
            await user.click(friendSelectorPanelSubmitButton);

            expect(addFriendsToChatSpy).toHaveBeenCalled();
        });
        test(`Unless there is at least one value in the returned array of
         friends to add that is not a valid MongoDB ObjectId`, async () => {
            const addFriendsToChatSpy = vi.spyOn(addFriendsToChat, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const addFriendsToChatButton = screen.getByRole("button", { name: "add person" });
            await user.click(addFriendsToChatButton);

            const friendSelectorPanelSubmitButton = screen.getByRole("button", { name: "friend-selector-panel-mock-submit-button-invalid" });
            await user.click(friendSelectorPanelSubmitButton);
            
            expect(addFriendsToChatSpy).not.toHaveBeenCalled();
        });
        test(`Should invoke the 'getChat' API function after getting a response
         from the 'addFriendsToChat' API function`, async () => {
            const getChatSpy = vi.spyOn(getChat, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const addFriendsToChatButton = screen.getByRole("button", { name: "add person" });
            await user.click(addFriendsToChatButton);

            const friendSelectorPanelSubmitButton = screen.getByRole("button", { name: "friend-selector-panel-mock-submit-button-valid" });
            await user.click(friendSelectorPanelSubmitButton);
            
            expect(getChatSpy).toHaveBeenCalled();
        });
        test(`Unless the response from the 'addFriendsToChat' API function has a
         status code < 400`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const addFriendsToChatButton = screen.getByRole("button", { name: "add person" });
            await user.click(addFriendsToChatButton);

            const getChatSpy = vi.spyOn(getChat, "default");
            addFriendsToChatMock.mockReturnValueOnce({
                status: 400,
                message: "Bad data.",
                chatId: null,
            });

            const friendSelectorPanelSubmitButton = screen.getByRole("button", { name: "friend-selector-panel-mock-submit-button-valid" });
            await user.click(friendSelectorPanelSubmitButton);
            
            expect(getChatSpy).not.toHaveBeenCalled();
        });
    });
    describe("The 'Call' ChatOption component...", () => {
        test(`Should be present in the document if the server has responded to
         the request in the 'getChat' API function with a valid chat`, async () => {
            await act(async () => { await renderComponent() });
            const callButton = screen.getByRole("button", { name: "call" });
            expect(callButton).toBeInTheDocument();
        });
    });
    describe("The 'Video Call' ChatOption component...", () => {
        test(`Should be present in the document if the server has responded to
         the request in the 'getChat' API function with a valid chat`, async () => {
            await act(async () => { await renderComponent() });
            const videoCallButton = screen.getByRole("button", { name: "call with video" });
            expect(videoCallButton).toBeInTheDocument();
        });
    });
    describe("The list element displaying the messages...", () => {
        test(`Should be present in the document if the server has responded to
         the request in the 'getChat' API function with a valid chat`, async () => {
            await act(async () => { await renderComponent() });
            const chatMessageList = screen.getByRole("list", { name: "chat-message-list" });
            expect(chatMessageList).toBeInTheDocument();
        });
        test(`Should have the same number of children as messages returned from
         the 'getChat' function (if there is at least 1 message)`, async () => {
            await act(async () => { await renderComponent() });
            const chatMessages = screen.getAllByRole("listitem", { name: "chat-message" });
            expect(chatMessages.length).toBe(messages.length);
        });
        test(`Should display information about there being no messages sent in
         the chat yet (if there are no messages)`, async () => {
            getChatMock.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    messages: [],
                },
            });
            await act(async () => { await renderComponent() });
            const emptyChatText = screen.getByLabelText("empty-chat-text");
            expect(emptyChatText).toBeInTheDocument();
        });
    });
    describe("The messages...", () => {
        test(`Should toggle/update the 'Replying to X...' message when their
         'onReplyToHandler' callback function is invoked`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            let replyingToMessage;
            const replyToMessageButtons = screen.getAllByRole("button", { name: "message-mock-reply-to-button" });

            replyingToMessage = screen.queryByRole("heading", { name: "replying-to-message"});
            expect(replyingToMessage).toBeNull();

            await user.click(replyToMessageButtons[0]);

            replyingToMessage = screen.getByRole("heading", { name: "replying-to-message"});
            expect(replyingToMessage).toBeInTheDocument();
        });
    });
    describe("The 'Load More' button...", () => {
        test(`Should be present in the document if the server has responded to
         the request in the 'getChat' API function with a valid chat`, async () => {
            await act(async () => { await renderComponent() });
            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            expect(loadMoreButton).toBeInTheDocument();
        });
        test(`Should, when clicked, attempt to append more messages to the
         chats list`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });
            let chatMessages;
            
            chatMessages = screen.getAllByRole("listitem", { name: "chat-message" });
            expect(chatMessages.length).toBe(messages.length);

            getChatMock.mockReturnValueOnce({
                status: 200,
                message: "Chat found.",
                chat: {
                    ...chat,
                    messages: [
                        {
                            _id: 4,
                            author: { ...users[0] },
                            text: "Message 5 text",
                            image: {
                                img: {
                                    data: {
                                        data: new Uint8Array(),
                                    },
                                },
                            },
                            deleted: false,
                        },
                    ],
                },
            });

            const loadMoreButton = screen.getByRole("button", { name: "load-more" });
            fireEvent.mouseLeave(loadMoreButton);
            await user.click(loadMoreButton);

            chatMessages = screen.getAllByRole("listitem", { name: "chat-message" });
            expect(chatMessages.length).toBe(messages.length + 1);
        });
    });
    describe("The 'MessageBox' component...", () => {
        test(`Should be present in the document if the server has responded to
         the request in the 'getChat' API function with a valid chat`, async () => {
            await act(async () => { await renderComponent() });
            const messageBox = screen.getByRole("generic", { name: "message-box-mock" });
            expect(messageBox).toBeInTheDocument();
        });
        test(`Otherwise, it should not be present in the document`, async () => {
            getChatMock.mockReturnValueOnce({
                status: 400,
                message: "Chat not found.",
                chat: null,
            })
            await act(async () => { await renderComponent() });
            const messageBox = screen.queryByRole("generic", { name: "message-box-mock" });
            expect(messageBox).toBeNull();
        });
        test(`Should invoke the 'sendMessage.text' API function if its
         'onSubmitHandler' callback function is invoked with an object argument
         containing the property: 'type' with a value of 'text'`, async () => {
            const sendMessageTextSpy = vi.spyOn(sendMessage, "text");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const messageBoxTextSubmitButton = screen.getByRole("button", { name: "message-box-mock-text-submit-button" });
            await user.click(messageBoxTextSubmitButton);

            expect(sendMessageTextSpy).toHaveBeenCalled();
        });
        test(`And should still succeed when replying to a message`, async () => {
            const sendMessageTextSpy = vi.spyOn(sendMessage, "text");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const replyToMessageButtons = screen.getAllByRole("button", { name: "message-mock-reply-to-button" });
            await user.click(replyToMessageButtons[0]);

            const messageBoxTextSubmitButton = screen.getByRole("button", { name: "message-box-mock-text-submit-button" });
            await user.click(messageBoxTextSubmitButton);

            expect(sendMessageTextSpy).toHaveBeenCalled();
        });
        test(`Unless the 'replying to' message _id fails its validation`, async () => {
            const sendMessageTextSpy = vi.spyOn(sendMessage, "text");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const replyToMessageButtons = screen.getAllByRole("button", { name: "message-mock-reply-to-button" });
            await user.click(replyToMessageButtons[0]);

            validateMessageReplyingToMock.mockReturnValueOnce({
                status: false,
                message: "Invalid Message _id to reply to.",
            });

            const messageBoxTextSubmitButton = screen.getByRole("button", { name: "message-box-mock-text-submit-button" });
            await user.click(messageBoxTextSubmitButton);

            expect(sendMessageTextSpy).not.toHaveBeenCalled();
        });
        test(`Or if the message text fails its validation`, async () => {
            const sendMessageTextSpy = vi.spyOn(sendMessage, "text");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            validateMessageTextMock.mockReturnValueOnce({
                status: false,
                message: "Invalid Message Text.",
            });

            const messageBoxTextSubmitButton = screen.getByRole("button", { name: "message-box-mock-text-submit-button" });
            await user.click(messageBoxTextSubmitButton);

            expect(sendMessageTextSpy).not.toHaveBeenCalled();
        });
        test(`Should invoke the 'sendMessage.image' API function if its
         'onSubmitHandler' callback function is invoked with an object argument
         containing the property: 'type' with a value of 'text'`, async () => {
            const sendMessageImageSpy = vi.spyOn(sendMessage, "image");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const messageBoxImageSubmitButton = screen.getByRole("button", { name: "message-box-mock-image-submit-button" });
            await user.click(messageBoxImageSubmitButton);

            expect(sendMessageImageSpy).toHaveBeenCalled();
        });
        test(`And should still succeed when replying to a message`, async () => {
            const sendMessageImageSpy = vi.spyOn(sendMessage, "image");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const replyToMessageButtons = screen.getAllByRole("button", { name: "message-mock-reply-to-button" });
            await user.click(replyToMessageButtons[0]);

            const messageBoxImageSubmitButton = screen.getByRole("button", { name: "message-box-mock-image-submit-button" });
            await user.click(messageBoxImageSubmitButton);

            expect(sendMessageImageSpy).toHaveBeenCalled();
        });
        test(`Unless the message image fails its validation`, async () => {
            const sendMessageImageSpy = vi.spyOn(sendMessage, "image");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            validateMessageImageMock.mockReturnValueOnce({
                status: false,
                message: "Invalid Message Image.",
            });

            const messageBoxImageSubmitButton = screen.getByRole("button", { name: "message-box-mock-image-submit-button" });
            await user.click(messageBoxImageSubmitButton);

            expect(sendMessageImageSpy).not.toHaveBeenCalled();
        });
        test(`And after receiving a response from the 'sendMessage.text/image'
         API function, the 'getChat' API function should be invoked`, async () => {
            const getChatSpy = vi.spyOn(getChat, "default");
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const messageBoxTextSubmitButton = screen.getByRole("button", { name: "message-box-mock-text-submit-button" });
            await user.click(messageBoxTextSubmitButton);

            expect(getChatSpy).toHaveBeenCalled();
        });
        test(`Unless the response from the 'sendMessage.text/image' API function
         has a status sode >= 400`, async () => {
            const user = userEvent.setup();
            await act(async () => { await renderComponent() });

            const getChatSpy = vi.spyOn(getChat, "default");
            vi.spyOn(sendMessage, "text").mockReturnValueOnce({
                status: 400,
                message: "Bad data.",
                newMessage: null,
            });

            const messageBoxTextSubmitButton = screen.getByRole("button", { name: "message-box-mock-text-submit-button" });
            await user.click(messageBoxTextSubmitButton);

            expect(getChatSpy).not.toHaveBeenCalled();
        });
    });
    describe("A 'no chat' message...", () => {
        test(`Should be present if the chat returned by the 'getChat' function
         is null`, async () => {
            getChatMock.mockReturnValueOnce({
                status: 404,
                message: "Chat not found.",
                chat: null,
            });
            await act(async () => { await renderComponent() });
            const emptyChatMessage = screen.getByLabelText("no-chat-here");
            expect(emptyChatMessage).toBeInTheDocument();
        });
        test(`Should not be present if the chat returned by the 'getChat'
         function is not null`, async () => {
            await act(async () => { await renderComponent() });
            const emptyChatMessage = screen.queryByLabelText("no-chat-here");
            expect(emptyChatMessage).toBeNull();
        });
    });
});