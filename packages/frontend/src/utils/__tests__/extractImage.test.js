/* global describe, test, expect */

import { test } from "vitest";
import * as extractImage from "../extractImage.js";

import ProfileImage from "@/components/ProfileImage";

describe("The 'defaultProps' method...", () => {
    test(`Should return an object containing the properties 'found' with a
    value of 'false', and 'image' which is an object with three properties:
    'src', 'alt' and 'status'`, () => {
        const props = extractImage.defaultProps();
        expect(props).toStrictEqual({
            src: new Uint8Array(),
            alt: "",
            status: null,
        });
    });
});
describe("When calling the 'fromUser' method...", () => {
    test(`If the argument is not in the correct format of the User schema, the
       return value should match that of the 'defaultProps' function`, async () => {
        const image = extractImage.fromUser(null);
        expect(image).toStrictEqual({
            found: false,
            image: { ...extractImage.defaultProps() },
        });
    });
    test(`If the argument is in the correct format of the User schema, the
       return value should contain the correct properties in place of the
       default ones returned by the 'defaultProps' function`, async () => {
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
                ...extractImage.defaultProps(),
                src: Uint8Array.from([0, 1, 2]),
                alt: "alt text",
                status: "busy",
            },
        });
    });
});
describe("When calling the 'fromChat' method...", () => {
    test(`If the argument is not in the correct format of the User schema, the
    return value should match that of the 'defaultProps' function`, async () => {
        const image = extractImage.fromChat(null);
        expect(image).toStrictEqual({
            found: false,
            image: { ...extractImage.defaultProps() },
        });
    });
    test(`If the argument is in the correct format of the User schema, the
    return value should contain the correct properties in place of the
    default ones returned by the 'defaultProps' function`, async () => {
        const image = extractImage.fromChat({
            image: {
                img: { data: { data: [0, 1, 2] } },
                alt: "alt text",
            },
        });
        expect(image).toStrictEqual({
            found: true,
            image: {
                ...extractImage.defaultProps(),
                src: Uint8Array.from([0, 1, 2]),
                alt: "alt text"
            },
        });
    });
});
describe("When calling the 'fromMessage' method...", () => {
    test(`If the argument is not in the correct format of the User schema, the
    return value should match that of the 'defaultProps' function`, async () => {
        const image = extractImage.fromMessage(null);
        expect(image).toStrictEqual({
            found: false,
            image: { ...extractImage.defaultProps() },
        });
    });
    test(`If the argument is in the correct format of the User schema, the
    return value should contain the correct properties in place of the
    default ones returned by the 'defaultProps' function`, async () => {
        const image = extractImage.fromMessage({
            image: {
                img: { data: { data: [0, 1, 2] } },
                alt: "alt text",
            },
        });
        expect(image).toStrictEqual({
            found: true,
            image: {
                ...extractImage.defaultProps(),
                src: Uint8Array.from([0, 1, 2]),
                alt: "alt text"
            },
        });
    });
});
