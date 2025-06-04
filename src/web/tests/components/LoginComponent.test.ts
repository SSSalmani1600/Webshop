import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import { LoginComponent } from "@web/components/LoginComponent";

// Mock window.location.href
const mockLocation: { href: string } = {
    href: "",
};

Object.defineProperty(window, "location", {
    value: mockLocation,
    writable: true,
});

beforeEach(() => {
    vi.resetAllMocks();
    mockLocation.href = "";

    // Mock VITE_API_URL environment variable
    Object.defineProperty(globalThis, "VITE_API_URL", {
        value: "http://localhost:3001/",
        writable: true,
    });

    global.fetch = vi.fn();
    vi.spyOn(console, "log").mockImplementation(() => { });
    vi.spyOn(console, "error").mockImplementation(() => { });
});

describe("LoginComponent", () => {
    let loginComponent: LoginComponent;

    beforeEach(() => {
        loginComponent = new LoginComponent();

        // Simpele HTML structuur
        loginComponent.innerHTML = `
            <input type="text" name="username" placeholder="Email of gebruikersnaam" required>
            <password-input></password-input>
            <button type="submit">Log in</button>
            <input type="checkbox" name="remember">
        `;

        document.body.appendChild(loginComponent);
        loginComponent.connectedCallback();
    });

    afterEach(() => {
        document.body.removeChild(loginComponent);
    });

    test("renders login form elements", () => {
        const emailInput: Element | null = loginComponent.querySelector("input[name='username']");
        const submitButton: Element | null = loginComponent.querySelector("button[type='submit']");
        const checkbox: Element | null = loginComponent.querySelector("input[type='checkbox']");

        expect(emailInput).not.toBeNull();
        expect(submitButton).not.toBeNull();
        expect(checkbox).not.toBeNull();
    });

    test("creates error message container", () => {
        const errorMessage: Element | null = loginComponent.querySelector(".error-message");
        expect(errorMessage).not.toBeNull();
    });

    test("shows error when fields are empty", async () => {
        const submitButton: HTMLButtonElement = loginComponent.querySelector("button[type='submit']") as HTMLButtonElement;

        submitButton.click();

        await waitFor(() => {
            const errorMessage: HTMLElement = loginComponent.querySelector(".error-message") as HTMLElement;
            expect(errorMessage.style.display).toBe("block");
            expect(errorMessage.textContent).toContain("vereist");
        });
    });
});
