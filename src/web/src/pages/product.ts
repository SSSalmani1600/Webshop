import "@web/components/ProductComponent";
import "@web/components/Add_to_cartcomponent";
import "@web/components/AddToWishlistComponent";
import "@web/components/NavbarComponent";
import { html } from "@web/helpers/webComponents";

export class ProductPageComponent extends HTMLElement {
  public connectedCallback(): void {
    this.attachShadow({ mode: "open" });
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) return;

    const template: HTMLElement = html`
      <div>
        <navbar-component></navbar-component>
        <game-list></game-list>
      </div>
    `;

    this.shadowRoot.firstChild?.remove();
    this.shadowRoot.append(template);
  }
}

window.customElements.define("webshop-page-products", ProductPageComponent);
