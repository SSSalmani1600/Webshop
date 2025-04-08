import { html } from "@web/helpers/webComponents";

export class NavigationComponent extends HTMLElement {
    public connectedCallback(): void {
        this.attachShadow({ mode: "open" });

        this.render();
    }

    private render(): void {
        if (!this.shadowRoot) {
            return;
        }

        const element: HTMLElement = html`
            <nav>
                <a href="/index.html">Home</a>
                <a href="/example.html">Example</a>
            </nav>
        `;

        this.shadowRoot.firstChild?.remove();
        this.shadowRoot.append(element);
    }
}

window.customElements.define("webshop-navigation", NavigationComponent);
