import { describe, it, expect, beforeEach } from "vitest";
import { OrderConfirmationComponent } from "@web/components/OrderCompleteComponent"; // ✅ Correct
import "@testing-library/jest-dom";

beforeEach(() => {
    if (customElements.get("order-confirmation")) {
        customElements.define("order-confirmation", OrderConfirmationComponent);
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
        // eslint-disable-next-line @typescript-eslint/typedef
        const title = shadow.querySelector("h1");

        expect(title).toBeInTheDocument();
        expect(title?.textContent).toMatch(/bedankt voor uw bestelling/i);

        // eslint-disable-next-line @typescript-eslint/typedef
        const total = shadow.querySelector(".order-total");
        expect(total).toBeInTheDocument();
    });
});
