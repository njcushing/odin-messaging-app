/* global describe, test, expect */

import * as chatOptionProps from "../calculateChatOptionProps.js";

import * as combineParticipantNames from "../../../../utils/combineParticipantNames.js";
import * as extractImage from "@/utils/extractImage.js";

const arg1 = {
    name: "chatName",
    participants: [
        {
            user: {
                _id: 0,
                username: "0username",
                preferences: { displayName: "0displayname" },
                status: "away",
            },
            role: "guest",
            nickname: "",
        },
        {
            user: {
                _id: 1,
                username: "1username",
                preferences: { displayName: "" },
                status: "online",
            },
            role: "guest",
            nickname: "",
        },
        {
            user: {
                _id: 2,
                username: "2username",
                preferences: { displayName: "2displayname" },
                status: "busy",
            },
            role: "guest",
            nickname: "2nickname",
        },
    ],
    messages: [{ author: 0, text: "hello" }],
    image: null,
};

const combineParticipantNamesMock = vi.fn(() => "combined");
vi.mock("../../../../utils/combineParticipantNames.js", async () => ({
    default: () => combineParticipantNamesMock(),
}));

const fromChat = vi.fn(() => ({
    found: true,
    image: new Uint8Array(),
}));
const fromMessage = vi.fn(() => ({
    found: true,
    image: new Uint8Array(),
}));
vi.mock("@/utils/extractImage.js", async () => {
    const actual = await vi.importActual("@/utils/extractImage.js");
    return {
        ...actual,
        fromChat: () => fromChat(),
        fromMessage: () => fromMessage(),
    };
});

describe(`The 'defaultProps method...`, () => {
    test(`Should return an object containing the necessary properties: 'name' as
       an empty string, 'recentMessage' as 'null', 'status' as 'null' and
       'image' as an object containing the properties: 'src' as a new
       Uint8Array, and 'alt' as an empty string`, () => {
        expect(chatOptionProps.defaultProps()).toStrictEqual({
            name: "",
            recentMessage: null,
            status: null,
            image: {
                src: new Uint8Array([]),
                alt: "",
            },
        });
    });
    test(`If the chat provided as the first argument has a 'name' property which
       is a string with at least 1 character, that should be the value of the
       'name' property in the returned object, otherwise it should be the return
       value of the 'combineParticipantNames' function`, () => {
        const props1 = chatOptionProps.calculateProps(arg1, 0);
        expect(props1.name).toBe("chatName");

        const spy = vi.spyOn(combineParticipantNames, "default");
        const props2 = chatOptionProps.calculateProps(
            {
                ...arg1,
                name: "",
            },
            0
        );
        expect(spy).toHaveBeenCalled();
        expect(props2.name).toBe("combined");
    });
    test(`If the chat provided as the first argument does not contain any
       messages in its 'messages' array, the 'recentMessage' property of the
       returned object should have a value of 'null'`, () => {
        const props = chatOptionProps.calculateProps(
            {
                ...arg1,
                messages: [],
            },
            0
        );
        expect(props.recentMessage).toBeNull();
    });
    test(`For a given message, the returned 'recentMessage' property should
       contain a property 'author' which should be a string that uses the
       participant's nickname in the chat, display name, or username
       (prioritising in that order)`, () => {
        const props1 = chatOptionProps.calculateProps(
            { ...arg1, messages: [{ author: 0, text: "a" }] },
            0
        );
        expect(props1.recentMessage).toStrictEqual({
            author: "0displayname",
            message: "a",
        });
        const props2 = chatOptionProps.calculateProps(
            { ...arg1, messages: [{ author: 1, text: "b" }] },
            0
        );
        expect(props2.recentMessage).toStrictEqual({
            author: "1username",
            message: "b",
        });
        const props3 = chatOptionProps.calculateProps(
            { ...arg1, messages: [{ author: 2, text: "c" }] },
            0
        );
        expect(props3.recentMessage).toStrictEqual({
            author: "2nickname",
            message: "c",
        });
    });
    test(`If the chat provided as the first argument has multiple messages in
       its 'messages' array, the 'recentMessage' property of the returned object
       should be the first one in the array`, () => {
        const props = chatOptionProps.calculateProps(
            {
                ...arg1,
                messages: [
                    { author: 0, text: "a" },
                    { author: 1, text: "b" },
                ],
            },
            0
        );
        expect(props.recentMessage).toStrictEqual({
            author: "0displayname",
            message: "a",
        });
    });
    test(`If the message is an image message, the 'message' property of the
       'recentMessage' object should be 'Image', only if that image is found by
       the 'extractImage.fromMessage' method`, () => {
        const props = chatOptionProps.calculateProps(
            {
                ...arg1,
                messages: [{ author: 0, image: new Uint8Array() }],
            },
            2
        );
        expect(props.recentMessage).toStrictEqual({
            author: "0displayname",
            message: "Image",
        });
    });
    test(`Otherwise, the value of 'recentMessage.message' should be '...'`, () => {
        fromMessage.mockReturnValueOnce({ found: false, image: null });
        const props = chatOptionProps.calculateProps(
            {
                ...arg1,
                messages: [{ author: 0, image: new Uint8Array() }],
            },
            1
        );
        expect(props.recentMessage).toStrictEqual({
            author: "0displayname",
            message: "...",
        });
    });
    test(`The 'status' property of the returned object should be the 'highest'
       value in the heirarchy from checking the status of all participants
       ("online" > "away" > "busy" > "offline" > "null")`, () => {
        const props = chatOptionProps.calculateProps(arg1, 0);
        expect(props.status).toBe("online");
    });
});
