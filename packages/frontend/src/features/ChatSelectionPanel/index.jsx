import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./index.module.css";

import OptionButton from "@/components/OptionButton";
import AddFriendPanel from "./components/AddFriendPanel";
import CreateChatPanel from "./components/CreateChatPanel";
import FriendSelectorPanel from "./components/FriendSelectorPanel";
import ChatOption from "./components/ChatOption";
import ChatPanel from "./components/ChatPanel";
import FriendRequest from "./components/FriendRequest";

import * as getChatListFromAPI from "./utils/getChatListFromAPI.js";
import getFriendRequests from "./utils/getFriendRequests.js";

const ChatSelectionPanel = ({
    chatType,
}) => {
    const [chatList, setChatList] = useState([]);
    const [addingFriend, setAddingFriend] = useState(false);
    const [creatingChat, setCreatingChat] = useState(false);
    const [creatingGroup, setCreatingGroup] = useState(false);
    const [viewingFriendRequests, setViewingFriendRequests] = useState(false);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friendRequestsAC, setFriendRequestsAC] = useState(null);

    useEffect(() => {
        (async () => {
            let chatListNew = [];
            switch (chatType) {
                case "friends":
                    chatListNew = await getChatListFromAPI.friends();
                    break;
                case "groups":
                    chatListNew = await getChatListFromAPI.groups();
                    break;
                case "communities":
                    chatListNew = await getChatListFromAPI.communities();
                    break;
                default:
                    chatListNew = [];
            }
            setChatList(chatListNew);
        })();

        return () => {
            if (friendRequestsAC) friendRequestsAC.abort;
        }
    }, [chatType]);

    useEffect(() => {
        if (friendRequestsAC) friendRequestsAC.abort;
        if (viewingFriendRequests) {
            const friendRequestsACNew = new AbortController();
            setFriendRequestsAC(friendRequestsACNew);
            (async () => {
                const friendRequestsNew = await getFriendRequests(friendRequestsACNew);
                setFriendRequests(friendRequestsNew.friendRequests);
            })();
        } else {
            setFriendRequestsAC(null);
        }
        return () => {
            if (friendRequestsAC) friendRequestsAC.abort;
        }
    }, [viewingFriendRequests]);

    let rightPanelContent = null;
    if (addingFriend) {
        rightPanelContent = (
            <AddFriendPanel
                onCloseHandler={() => setAddingFriend(false)}
                addFriendHandler={() => {}}
                addFriendSubmissionErrors={[]}
            />
        );
    } else if (creatingChat) {
        rightPanelContent = (
            <CreateChatPanel
                onCloseHandler={() => setCreatingChat(false)}
                createChatHandler={() => {}}
                createChatSubmissionErrors={[]}
            />
        );
    } else if (creatingGroup) {
        rightPanelContent = (
            <FriendSelectorPanel
                title="Create New Group"
                removeButtonText="Remove"
                addButtonText="Add"
                submitButtonText="Create Group"
                noFriendsText="You have no friends with whom you can create a group"
                onCloseHandler={() => setCreatingGroup(false)}
                onSubmitHandler={() => {}}
                submissionErrors={[]}
            />
        );
    } else {
        rightPanelContent = (
            <div className={styles["chat-panel"]}>
                <ChatPanel />
            </div>
        );
    }

    let title = chatType;
    if (chatType === "friends" && viewingFriendRequests) title = "Friend Requests";

    return (
        <div className={styles["wrapper"]}>
        <div className={styles["container"]}>
            <div className={styles["chat-selection-panel"]}>
                <h3
                    className={styles["chat-list-title"]}
                    aria-label="chat-list-title"
                >{title}</h3>
                {chatType === "friends" || chatType === "groups"
                ?   <ul
                        className={styles["chat-selection-panel-options-list"]}
                        aria-label="chat-selection-panel-options-list"
                    >
                        {chatType === "friends"
                        ?   <>
                            <li
                                className={styles["add-friend-button"]}
                                aria-label="add-friend-button"
                            >
                                <OptionButton
                                    text="person_add"
                                    tooltipText="Add Friend"
                                    tooltipPosition="bottom"
                                    widthPx={50}
                                    heightPx={50}
                                    fontSizePx={24}
                                    borderStyle="circular"
                                    onClickHandler={() => {
                                        setAddingFriend(!addingFriend);
                                        setCreatingChat(false);
                                        setCreatingGroup(false);
                                    }}
                                />
                            </li>
                            {viewingFriendRequests
                            ?   <li
                                    className={styles["view-friend-chats-button"]}
                                    aria-label="view-friend-chats-button"
                                >
                                    <OptionButton
                                        text="chat"
                                        tooltipText="View Chats"
                                        tooltipPosition="bottom"
                                        widthPx={50}
                                        heightPx={50}
                                        fontSizePx={24}
                                        borderStyle="circular"
                                        onClickHandler={() => {
                                            setViewingFriendRequests(!viewingFriendRequests);
                                        }}
                                    />
                                </li>
                            :   <li
                                    className={styles["view-friend-requests-button"]}
                                    aria-label="view-friend-requests-button"
                                >
                                    <OptionButton
                                        text="how_to_reg"
                                        tooltipText="View Friend Requests"
                                        tooltipPosition="bottom"
                                        widthPx={50}
                                        heightPx={50}
                                        fontSizePx={24}
                                        borderStyle="circular"
                                        onClickHandler={() => {
                                            setViewingFriendRequests(!viewingFriendRequests);
                                        }}
                                    />
                                </li>
                            }
                            </>
                        :   null}
                        <li
                            className={styles["create-chat-button"]}
                            aria-label="create-chat-button"
                        >
                            <OptionButton
                                text="add"
                                tooltipText={
                                    chatType === "friends"
                                    ? "Create New Chat"
                                        : chatType === "groups"
                                        ? "Create New Group"
                                    : "Error"
                                }
                                tooltipPosition="bottom"
                                widthPx={50}
                                heightPx={50}
                                fontSizePx={24}
                                borderStyle="circular"
                                onClickHandler={() => {
                                    switch (chatType) {
                                        case "friends":
                                            setAddingFriend(false);
                                            setCreatingChat(!creatingChat);
                                            setCreatingGroup(false);
                                            break;
                                        case "groups":
                                            setAddingFriend(false);
                                            setCreatingChat(false);
                                            setCreatingGroup(!creatingGroup);
                                            break;
                                        default:
                                            setAddingFriend(false);
                                            setCreatingChat(false);
                                            setCreatingGroup(false);
                                    }
                                }}
                            />
                        </li>
                    </ul>
                :   null}
                {chatType === "friends" && viewingFriendRequests
                ?   <ul
                        className={styles["friend-request-list"]}
                        aria-label="friend-request-list"
                    >
                        {friendRequests.map((request) => {
                            return (
                                <li
                                    aria-label="friend-request"
                                    key={request._id}
                                ><FriendRequest
                                    username={request.username}
                                    imageSrc={""}
                                    imageAlt={""}
                                    onSuccessHandler={() => {
                                        const reducedFriendRequestsArray =
                                            friendRequests.filter((friend) => {
                                                friend._id !== request._id
                                            });
                                        setFriendRequests(reducedFriendRequestsArray);
                                    }}
                                /></li>
                            );
                        })}
                    </ul>
                :   <ul
                        className={styles["chat-list-options"]}
                        aria-label="chat-list-options"
                    >
                        {chatList.map((chat) => {
                            return (
                                <li
                                    aria-label="chat-option"
                                    key={chat._id}
                                ><ChatOption
                                    name={chat.name}
                                    tagLine={chat.tagLine}
                                    status={chat.status}
                                    imageSrc={chat.imageSrc}
                                    imageAlt={chat.imageAlt}
                                    onClickHandler={() => {}}
                                /></li>
                            );
                        })}
                    </ul>
                }
            </div>
            {rightPanelContent}
        </div>
        </div>
    );
};

ChatSelectionPanel.propTypes = {
    chatType: PropTypes.oneOf(["friends", "groups", "communities"]).isRequired,
}

export default ChatSelectionPanel;