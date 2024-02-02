/* global describe, test, expect */

import { vi } from 'vitest'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import Message from './index.jsx'

const props = {
    text: "Sample Text",
    image: {
        src: new Uint8Array(),
        alt: "body image alt text",
    },
    name: "My Name",
    dateSent: "2023-01-01T00:00:00",
    profileImage: {
        src: new Uint8Array(),
        alt: "body image alt text",
        status: null,
    },
    position: "right",
    replyingTo: {
        author: "Friend 1",
        text: "Message text",
        image: {
            src: new Uint8Array(),
            alt: "replying to image alt text",
        }
    },
    onReplyToHandler: () => {},
}

const renderComponent = (props) => {
    render(<Message
        text={props.text}
        image={props.image}
        name={props.name}
        dateSent={props.dateSent}
        profileImage={props.profileImage}
        position={props.position}
        replyingTo={props.replyingTo}
        onReplyToHandler={props.onReplyToHandler}
    />);
}

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

global.URL.createObjectURL = vi.fn(() => 'image');

describe(`Prop Testing...`, () => {
    describe(`The 'image' prop...`, () => {
        test(`When specified, should throw an error if the value of its property
         'src' is not either a Typed Array or number (to allow 'null')`, () => {
            const consoleErrorSpy = vi.spyOn(console, "error");
            consoleErrorSpy.mockReturnValueOnce(); // suppress console error
            renderComponent({ ...props, image: { src: "", alt: "" } });
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockClear();

            renderComponent(props);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });
    describe(`The 'replyingTo' prop...`, () => {
        test(`When specified, should throw an error if the value of its property
         'image.src' is not either a Typed Array or number (to allow 'null')`, () => {
            const consoleErrorSpy = vi.spyOn(console, "error");
            consoleErrorSpy.mockReturnValueOnce(); // suppress console error
            renderComponent({ ...props, replyingTo: {
                author: "",
                text: "",
                image: {
                    src: "",
                    alt: "",
                },
            }});
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockClear();

            renderComponent(props);
            expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
    });
});
describe(`UI/DOM Testing...`, () => {
    describe(`The <p> element displaying the message author name and date...`, () => {
        test(`Should be present in the document`, () => {
            renderComponent(props);
            const nameAndDate = screen.getByText("My Name at 01/01/2023, 00:00:00");
            expect(nameAndDate).toBeInTheDocument();
        });
    });
    describe(`The user's profile image...`, () => {
        test(`Should be present in the document`, () => {
            renderComponent(props);
            const profileImage = screen.getByRole("generic", { name: "profile-image" });
            expect(profileImage).toBeInTheDocument();
        });
    });
    describe(`The <p> element displaying the message text...`, () => {
        test(`Should be present in the document if the 'text' prop has a value
         of type String with a length greater than 0 characters`, () => {
            renderComponent(props);
            const messageText = screen.getByText("Sample Text");
            expect(messageText).toBeInTheDocument();
        });
        test(`Should not be present in the document if the 'text' prop has a
         value of type String with a length of 0 characters`, () => {
            renderComponent({ ...props, text: "" });
            const messageText = screen.queryByText("Sample Text");
            expect(messageText).toBeNull();
        });
    });
    describe(`The element displaying the message image...`, () => {
        test(`Should be present in the document if the 'image' prop is an object
         containing two properties: 'src' with a value of type Typed Array, and
         'alt' with a value of type String`, () => {
            renderComponent(props);
            const messageImage = screen.getByRole("img", { name: "message-image" });
            expect(messageImage).toBeInTheDocument();
            expect(messageImage.alt).toBe(props.image.alt);
        });
        test(`Should not be present in the document if the 'image' prop has a
         value of 'null'`, () => {
            renderComponent({ ...props, image: null });
            const messageImage = screen.queryByRole("img", { name: "message-image" });
            expect(messageImage).toBeNull();
        });
    });
    describe(`The element displaying the replying-to message image...`, () => {
        test(`Should be present in the document if the 'replyingTo' prop is an
         object containing a property: 'image' with a property: 'src' with a
         value of type Typed Array, and 'alt' with a value of type String`, () => {
            renderComponent(props);
            const replyingToMessageImage = screen.getByRole("img", { name: "replying-to-message-image" });
            expect(replyingToMessageImage).toBeInTheDocument();
            expect(replyingToMessageImage.alt).toBe(props.replyingTo.image.alt);
        });
        test(`Otherwise, it should not be present in the document`, () => {
            renderComponent({ ...props, replyingTo: {
                author: "",
                text: "",
                image: {
                    src: null,
                    alt: "",
                },
            }});
            const replyingToMessageImage = screen.queryByRole("img", { name: "replying-to-message-image" });
            expect(replyingToMessageImage).toBeNull();
        });
    });
});