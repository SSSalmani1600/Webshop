import type { Game } from "@api/types/Game";
import { SessionResponse } from "@shared/types";

export class GameSearchComponent extends HTMLElement {
    private shadow: ShadowRoot;

    public constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.renderLoading();
        void this.loadSearchResults();
    }

    private renderLoading(): void {
        this.shadow.innerHTML = "<p style="color: white;">Zoekresultaten worden geladen...</p>";
    }

    private async loadSearchResults(): Promise<void> {
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const query: string | null = urlParams.get("query");
    }
}
