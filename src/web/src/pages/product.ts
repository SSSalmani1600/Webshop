import "@web/components/ProductComponent";
import "@web/components/Add_to_cartcomponent";
import "@web/components/NavbarComponent";
import { html } from "@web/helpers/webComponents";

export class ProductPageComponent extends HTMLElement {
    public connectedCallback(): void {
        this.attachShadow({ mode: "open" });
        this.render();
    }

    private render(): void {
        if (!this.shadowRoot) return;

        const element: HTMLElement = html`
            <div>
                <navbar-component></navbar-component>
                <h1>Alle games</h1>
                <game-list></game-list>
            </div>
            
        `;

        this.shadowRoot.firstChild?.remove();
        this.shadowRoot.append(element);
    }
}

window.customElements.define("webshop-page-products", ProductPageComponent);
