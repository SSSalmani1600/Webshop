import "../components/GameDetailComponent";
import { html } from "../helpers/webComponents";

export class GameDetailPageComponent extends HTMLElement {
    public connectedCallback(): void {
        this.attachShadow({ mode: "open" });
        this.render();
    }

    private render(): void {
        if (!this.shadowRoot) return;

        const element: HTMLElement = html`
    <div>
      <h1>Game Detail</h1>
      <game-detail-page></game-detail-page>
    </div>
  `;

        this.shadowRoot.firstChild?.remove();
        this.shadowRoot.append(element);
    }
}

window.customElements.define("webshop-page-game-detail", GameDetailPageComponent);
