/* global describe, test, expect */

import { vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { forwardRef } from 'react'
import Dashboard from './index.jsx'

const renderComponent = async () => {
    await act(async () => { await render(<Dashboard />); });
}

vi.mock('@/components/OptionsSidebar', () => ({ 
    default: ({
        onOptionSelect,
    }) => {
        return (<></>);
    }
}));

vi.mock('@/components/FriendsPanel', () => ({ 
    default: () => {
        return (<></>);
    }
}));

vi.mock('@/components/ChatsPanel', () => ({ 
    default: () => {
        return (<></>);
    }
}));

describe("UI/DOM Testing...", () => {
    describe("The title element...", () => {
        test("Placeholder", () => {});
    });
});
