import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { WelcomeUserComponent } from "@web/components/WelcomeUserComponent";

beforeEach(() => {
    vi.resetAllMocks();

    Object.defineProperty(globalThis, "VITE_API_URL", {
        value: "http://localhost:3001/",
        writable: true,
    });

    global.fetch = vi.fn();
    vi.spyOn(console, "log").mockImplementation(() => { });
    vi.spyOn(console, "error").mockImplementation(() => { });
});

describe("WelcomeUserComponent", () => {
    let welcomeComponent: WelcomeUserComponent;

    beforeEach(() => {
        welcomeComponent = new WelcomeUserComponent();
        document.body.appendChild(welcomeComponent);
    });

    afterEach(() => {
        document.body.removeChild(welcomeComponent);
    });

    test("creates shadow root", () => {
        expect(welcomeComponent.shadowRoot).not.toBeNull();
    });

    test("has correct tag name", () => {
        expect(welcomeComponent.tagName.toLowerCase()).toBe("welcome-user");
    });

    test("is registered as custom element", () => {
        const element: HTMLElement = document.createElement("welcome-user");
        expect(element).toBeInstanceOf(WelcomeUserComponent);
    });
}); 
