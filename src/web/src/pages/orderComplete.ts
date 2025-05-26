import "@web/components/OrderCompleteComponent";
import { html } from "@web/helpers/webComponents";

export class OrderCompletePageComponent extends HTMLElement {
    public connectedCallback(): void {
        this.attachShadow({ mode: "open" });
        this.render();
    }

    private render(): void {
        if (!this.shadowRoot) return;

        const element: HTMLElement = html`
      <div>
        <h1>Bedankt voor je bestelling</h1>
        <order-confirmation></order-confirmation>
      </div>
    `;

        this.shadowRoot.firstChild?.remove();
        this.shadowRoot.append(element);
    }
}

window.customElements.define("webshop-page-order-complete", OrderCompletePageComponent);

