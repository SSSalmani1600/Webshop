import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { waitFor } from "@testing-library/dom";
import { LoginComponent } from "@web/components/LoginComponent";

/**
 * Mock object voor window.location.href
 * Wordt gebruikt om navigatie te simuleren in tests
 */
const mockLocation: { href: string } = {
    href: "",
};

Object.defineProperty(window, "location", {
    value: mockLocation,
    writable: true,
});

/**
 * Setup voor alle tests
 * Reset mocks en configureert test environment
 */
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

/**
 * Test suite voor de LoginComponent
 * Test de login functionaliteit van de webshop frontend
 */
describe("LoginComponent", () => {
    let loginComponent: LoginComponent;

    /**
     * Setup voor elke individuele test
     * Creëert een nieuwe LoginComponent instance met test HTML
     */
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

    /**
     * Cleanup na elke test
     * Verwijdert de component uit het DOM
     */
    afterEach(() => {
        document.body.removeChild(loginComponent);
    });

    /**
     * Test of alle login form elementen correct gerenderd worden
     * Controleert aanwezigheid van username input, submit button en remember checkbox
     */
    test("renders login form elements", () => {
        const emailInput: Element | null = loginComponent.querySelector("input[name='username']");
        const submitButton: Element | null = loginComponent.querySelector("button[type='submit']");
        const checkbox: Element | null = loginComponent.querySelector("input[type='checkbox']");

        expect(emailInput).not.toBeNull();
        expect(submitButton).not.toBeNull();
        expect(checkbox).not.toBeNull();
    });

    /**
     * Test of de error message container aangemaakt wordt
     * Valideert dat foutmeldingen getoond kunnen worden
     */
    test("creates error message container", () => {
        const errorMessage: Element | null = loginComponent.querySelector(".error-message");
        expect(errorMessage).not.toBeNull();
    });

    /**
     * Test of een foutmelding getoond wordt bij lege velden
     * Simuleert submit met lege inputs en controleert error display
     */
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
