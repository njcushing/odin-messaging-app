/* global describe, test, expect */

import * as extractImage from "../extractImage.js";

import ProfileImage from "@/components/ProfileImage";

const props = { ...ProfileImage.defaultProps };

describe("When calling the 'fromUser' method...", () => {
    test(`If the argument is not in the correct format of the User schema, the
       return value should be an object containing the properties 'found' with a
       value of 'false', and 'image' matching the defaultProps object of the
       ProfileImage component`, async () => {
        const image = extractImage.fromUser(null);
        expect(image).toStrictEqual({
            found: false,
            image: { ...props },
        });
    });
    test(`If the argument is in the correct format of the User schema, the
       return value should be an object containing the properties 'found' with a
       value of 'true', and 'image' containing the 'image', 'alt' and 'status'
       properties extracted from the object`, async () => {
        const image = extractImage.fromUser({
            preferences: {
                profileImage: {
                    img: { data: { data: [0, 1, 2] } },
                    alt: "alt text",
                },
            },
            status: "busy",
        });
        expect(image).toStrictEqual({
            found: true,
            image: {
                ...props,
                src: [0, 1, 2],
                alt: "alt text",
                status: "busy",
            },
        });
    });
});
describe("When calling the 'fromChat' method...", () => {
    test(`If the argument is not in the correct format of the Chat schema, the
       return value should be an object containing the properties 'found' with a
       value of 'false', and 'image' matching the defaultProps object of the
       ProfileImage component`, async () => {
        const image = extractImage.fromChat(null);
        expect(image).toStrictEqual({
            found: false,
            image: { ...props },
        });
    });
    test(`If the argument is in the correct format of the Chat schema, the
       return value should be an object containing the properties 'found' with a
       value of 'true', and 'image' containing the 'image' and 'alt' properties
       extracted from the object`, async () => {
        const image = extractImage.fromChat({
            image: {
                img: { data: { data: [0, 1, 2] } },
                alt: "alt text",
            },
        });
        expect(image).toStrictEqual({
            found: true,
            image: { ...props, src: [0, 1, 2], alt: "alt text" },
        });
    });
});
describe("When calling the 'fromMessage' method...", () => {
    test(`If the argument is not in the correct format of the Message schema,
       the return value should be an object containing the properties 'found' with
       a value of 'false', and 'image' matching the defaultProps object of the
       ProfileImage component`, async () => {
        const image = extractImage.fromMessage(null);
        expect(image).toStrictEqual({
            found: false,
            image: { ...props },
        });
    });
    test(`If the argument is in the correct format of the Message schema, the
       return value should be an object containing the properties 'found' with a
       value of 'true', and 'image' containing the 'image' and 'alt' properties
       extracted from the object`, async () => {
        const image = extractImage.fromMessage({
            image: {
                img: { data: { data: [0, 1, 2] } },
                alt: "alt text",
            },
        });
        expect(image).toStrictEqual({
            found: true,
            image: { ...props, src: [0, 1, 2], alt: "alt text" },
        });
    });
});
