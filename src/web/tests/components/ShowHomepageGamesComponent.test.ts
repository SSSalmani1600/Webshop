import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { ShowHomepageGamesComponent } from "@web/components/ShowHomepageGamesComponent";

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

describe("ShowHomepageGamesComponent", () => {
    let homepageComponent: ShowHomepageGamesComponent;

    beforeEach(() => {
        homepageComponent = new ShowHomepageGamesComponent();
        document.body.appendChild(homepageComponent);
    });

    afterEach(() => {
        document.body.removeChild(homepageComponent);
    });

    test("creates shadow root", () => {
        expect(homepageComponent.shadowRoot).not.toBeNull();
    });

    test("has correct tag name", () => {
        expect(homepageComponent.tagName.toLowerCase()).toBe("homepage-games");
    });

    test("is registered as custom element", () => {
        const element: HTMLElement = document.createElement("homepage-games");
        expect(element).toBeInstanceOf(ShowHomepageGamesComponent);
    });
});
