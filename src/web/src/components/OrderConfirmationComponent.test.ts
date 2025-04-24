import { describe, it, expect, beforeEach } from "vitest";
import { OrderConfirmationComponent } from "@web/pages/orderComplete";
import "@testing-library/jest-dom";

beforeEach(() => {
    if (customElements.get("order-confirmation")) {
        customElements.define("order-confirmation", OrderConfirmationComponent);
    }

    document.body.innerHTML = "";
});

describe("OrderConfirmationComponent", () => {
    it("should render the component with default content", () => {
        const component = document.createElement("order-confirmation");
        document.body.appendChild(component);

        const shadow = component.shadowRoot!;
        const title = shadow.querySelector("h1");

        expect(title).toBeInTheDocument();
        expect(title?.textContent).toMatch(/bedankt voor uw bestelling/i);

        const total = shadow.querySelector(".order-total");
        expect(total).toBeInTheDocument();
    });
});
