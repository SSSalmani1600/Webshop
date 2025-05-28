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

        if(!query) {
            this.shadow.innerHTML = `<p style="color: red;">Geen zoekterm opgegeven.</p>`;
            return;           
        }

        try {
            const sessionId = await this.getSession();
            const response = await fetch(`${VITE_API_URL}games/search?query=${encodeURIComponent(query)}`, {
                headers: {
                    "x-session": sessionId
                }
            });

            if (!response.ok) throw new Error("Kon zoekresultaten niet ophalen.");

            const games: Game[] = await response.json();
            this.renderResults(games, query);                        
        } 
        catch (error) {
            this.shadow.innerHTML = `<p style="color: red;">Fout: ${(error as Error).message}</p>`;        
        }
    }
}
