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
        <div style="display: flex; justify-content: flex-end; align-items: center; padding: 1rem;">
          <label for="sort-select" style="margin-right: 0.5rem;">Sorteer op prijs:</label>
          <select id="sort-select">
            <option value="asc">Laag → Hoog</option>
            <option value="desc">Hoog → Laag</option>
          </select>
        </div>
        <game-list></game-list>
      </div>
    `;

    this.shadowRoot.firstChild?.remove();
    this.shadowRoot.append(template);

    this.initSortEventListener();
  }

  private initSortEventListener(): void {
    const sortSelect = this.shadowRoot!.querySelector<HTMLSelectElement>("#sort-select");
const gameList = this.shadowRoot!.querySelector<HTMLElement>("game-list");


    if (!sortSelect || !gameList) return;

    sortSelect.addEventListener("change", () => {
      const selectedValue = sortSelect.value as "asc" | "desc";

      // @ts-expect-error: sortByPrice is publieke methode van game-list component
      if (typeof gameList.sortByPrice === "function") {
        // @ts-expect-error
        gameList.sortByPrice(selectedValue);
      } else {
        // eslint-disable-next-line no-console
        console.warn("De game-list component heeft geen sortByPrice functie.");
      }
    });
  }
}

window.customElements.define("webshop-page-products", ProductPageComponent);
