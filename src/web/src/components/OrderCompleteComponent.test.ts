import { describe, it, expect, beforeEach } from "vitest";
import { OrderCompleteComponent } from "@web/components/OrderCompleteComponent"; // ✅ Correct
import "@testing-library/jest-dom";

beforeEach(() => {
    if (customElements.get("order-confirmation")) {
        customElements.define("order-confirmation", OrderCompleteComponent);
    }

    document.body.innerHTML = "";
});

describe("OrderConfirmationComponent", () => {
    it("should render the component with default content", () => {
        // eslint-disable-next-line @typescript-eslint/typedef
        const component = document.createElement("order-confirmation");
        document.body.appendChild(component);

        // eslint-disable-next-line @typescript-eslint/typedef
        const shadow = component.shadowRoot!;

        const title: HTMLElement | null = shadow.querySelector("h1");
        expect(title).not.toBeNull();
        expect(title?.textContent).toMatch(/bedankt voor uw bestelling/i);
        const total: HTMLElement | null = shadow.querySelector(".order-total");
        expect(total).not.toBeNull();
        expect(total?.textContent).toBeDefined();
    });
});
