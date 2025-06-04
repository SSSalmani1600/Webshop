import { describe, it, expect, beforeEach } from "vitest";
import "./RandomGameComponent";

describe("RandomGameComponent", () => {
    let element: HTMLElement;

    beforeEach(() => {
        // Maak een nieuw component element voor elke test
        element = document.createElement("random-game");
        document.body.appendChild(element);
    });

    it("should create shadow root", () => {
        expect(element.shadowRoot).toBeDefined();
    });

    it("should be registered as custom element", () => {
        const registeredElement: CustomElementConstructor | undefined = window.customElements.get("random-game");
        expect(registeredElement).toBeDefined();
    });

    it("should render random game button", () => {
        const button: HTMLButtonElement | null = element.shadowRoot?.querySelector("#randomButton") as HTMLButtonElement;
        expect(button).toBeDefined();
        expect(button.textContent?.trim()).toContain("Verras mij");
    });

    it("should have proper styling container", () => {
        const container: HTMLDivElement | null = element.shadowRoot?.querySelector(".random-game-container") as HTMLDivElement;
        expect(container).toBeDefined();
    });
});
