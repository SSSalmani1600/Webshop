import { beforeEach } from "node:test";

beforeEach(() => {
    if (customElements.get("order-confirmation")) {
        customElements.define("order-confirmation", OrderConfirmationComponent);
    }

    document.body.innerHTML = "",
});
