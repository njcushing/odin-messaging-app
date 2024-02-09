/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from "react-router-dom"
import AddFriendPanel from './index.jsx'

const renderComponent = async (
    onCloseHandler = () => {},
) => { act(() => render(
    <AddFriendPanel
        onCloseHandler={onCloseHandler}
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

const mockUser = {
    _id: "1",
    name: "Person 1",
    tagLine: "Person 1 tagline",
    imageSrc: "",
    imageAlt: "",
}
const findUser = vi.fn(() => mockUser);
vi.mock('./utils/findUser', async () => ({
    default: () => findUser(),
}));

describe("UI/DOM Testing...", () => {
    describe("The heading element displaying the title...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const title = screen.getByRole("heading", { name: "add-friend-panel" });
            expect(title).toBeInTheDocument();
        });
    });
    describe("The label element for the 'Name' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const nameLabel = screen.getByLabelText("Name:");
            expect(nameLabel).toBeInTheDocument();
        });
    });
    describe("The 'Name' input...", () => {
        test(`Should be present in the document`, async () => {
            await renderComponent();
            const nameInput = screen.getByRole("textbox", { name: "friend-name-input" });
            expect(nameInput).toBeInTheDocument();
        });
    });
    describe("The 'No result found' message...", () => {
        test("Should be present in the document by default", async () => {
            await renderComponent();
            const noResultFoundMessage = screen.getByRole("heading", { name: "no-result-found" });
            expect(noResultFoundMessage).toBeInTheDocument();
        });
        test(`Should not be present in the document if a User has been found`, async () => {
            const user = userEvent.setup();
            await renderComponent();
            const nameInput = screen.getByRole("textbox", { name: "friend-name-input" });
            await user.type(nameInput, "a");
            const noResultFoundMessage = screen.queryByRole("heading", { name: "no-result-found" });
            expect(noResultFoundMessage).toBeNull();
        });
    });
    describe("The User profile...", () => {
        test("Should not be present in the document by default", async () => {
            await renderComponent();
            const resultFound = screen.queryByRole("generic", { name: "result-found" });
            expect(resultFound).toBeNull();
        });
        test("Should display a profile image", async () => {
            const user = userEvent.setup();
            await renderComponent();
            const nameInput = screen.getByRole("textbox", { name: "friend-name-input" });
            await user.type(nameInput, "a");
            const userProfileImage = screen.getByRole("generic", { name: "profile-image" });
            expect(userProfileImage).toBeInTheDocument();
        });
        test("Should display a name", async () => {
            const user = userEvent.setup();
            await renderComponent();
            const nameInput = screen.getByRole("textbox", { name: "friend-name-input" });
            await user.type(nameInput, "a");
            const userName = screen.getByLabelText("result-found-name");
            expect(userName).toBeInTheDocument();
        });
        test("Should display an 'Add Friend' button", async () => {
            const user = userEvent.setup();
            await renderComponent();
            const nameInput = screen.getByRole("textbox", { name: "friend-name-input" });
            await user.type(nameInput, "a");
            const addFriendButton = screen.getByRole("button", { name: "add-friend-button" });
            expect(addFriendButton).toBeInTheDocument();
        });
    });
});