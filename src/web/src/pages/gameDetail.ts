import "@web/components/NavbarComponent";
import "@web/components/ProductDetailComponent";
import { html } from "@web/helpers/webComponents";

export class GameDetailPageComponent extends HTMLElement {
    public connectedCallback(): void {
        this.attachShadow({ mode: "open" });
        this.render();
    }

    private render(): void {
        if (!this.shadowRoot) return;

        const element: HTMLElement = html`
    <div>
      <navbar-component></navbar-component>
      <game-detail-page></game-detail-page>
    </div>
  `;

        this.shadowRoot.firstChild?.remove();
        this.shadowRoot.append(element);
    }
}

window.customElements.define("webshop-page-game-detail", GameDetailPageComponent);
