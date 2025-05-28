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

    private async getSession(): Promise<string> {
        const res: Response = await fetch(`${VITE_API_URL}session`);
        const data: unknown = await res.json();     
        
        if (
            typeof data === "object" &&
            data !== null &&
            "sessionId" in data &&
            typeof (data as SessionResponse).sessionId === "string"           
        ) {
            return (data as SessionResponse).sessionId;
        }

        throw new Error("Invalid session object");
    }

    private renderResult(games: Game[], query: string): void {
        if (games.length === 0) {
            this.shadow.innerHTML = `<p style="color: white;">Geen resultaten gevonden voor "<strong>${query}</strong>"</p>`;
            return;            
        }

        this.shadow.innerHTML = `
            <style>
                :host {
                    display: block;
                    padding: 40px;
                    background-color: #0f0f0f;
                    color: white;
                    font-family: 'Inter', sans-serif;
                    width: 100%;
                    min-height: 100vh;
                    box-sizing: border-box;
                }

                h2 {
                    font-size: 24px;
                    margin-bottom: 20px;
                }

                .results {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }

                .game-card {
                    background-color: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 12px;
                    padding: 16px;
                    transition: transform 0.2s;
                }

                .game-card:hover {
                    transform: scale(1.02);
                }

                .game-card img {
                    width: 100%;
                    border-radius: 8px;
                    margin-bottom: 12px;
                }

                .game-card h3 {
                    margin: 0 0 10px;
                    font-size: 18px;
                }

                .game-card a {
                    display: inline-block;
                    margin-top: 8px;
                    text-decoration: none;
                    color: #7f41f5;
                    font-weight: bold;
                }
            </style>
        `;       
    }
}
