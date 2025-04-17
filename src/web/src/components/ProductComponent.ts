import type { Game } from "../../../api/src/types/Game";

interface SessionResponse {
    sessionId: string;
}

class GameList extends HTMLElement {
    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public async connectedCallback(): Promise<void> {
        console.log("GameList component is connected.");

        try {
            const sessionId: string = await this.getSession();
            console.log("Session ID:", sessionId);

            const res: Response = await fetch("http://localhost:3001/products", {
                headers: {
                    "x-session": sessionId,
                },
            });

            if (!res.ok) {
                console.error("Fout bij het ophalen van games:", res.status);
                this.renderError(`Fout bij ophalen van games: ${res.status}`);
                return;
            }

            const games: Game[] = (await res.json()) as Game[];
            console.log("Games opgehaald:", games);

            if (games.length === 0) {
                this.renderError("Geen games gevonden.");
                return;
            }

            this.render(games);
        }
        catch (error) {
            console.error("Er trad een fout op:", error);
            this.renderError("Er is een onverwachte fout opgetreden.");
        }
    }

    private async getSession(): Promise<string> {
        const res: Response = await fetch("http://localhost:3001/session");
        const data: unknown = await res.json();

        if (
            typeof data === "object" &&
            data !== null &&
            "sessionId" in data &&
            typeof (data as SessionResponse).sessionId === "string"
        ) {
            console.log("Session opgehaald:", data);
            return (data as SessionResponse).sessionId;
        }

        throw new Error("Ongeldig sessie-object");
    }

    private renderError(message: string): void {
        const style: string = `
            <style>
              :host {
                display: block;
                padding: 20px;
                font-family: Arial, sans-serif;
              }

              p {
                color: red;
                font-size: 18px;
                font-weight: bold;
              }
            </style>
        `;

        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = style + `<p>${message}</p>`;
    }

    private render(games: Game[]): void {
        const style: string = `
            <style>
              :host {
                display: block;
                padding: 20px;
                font-family: Arial, sans-serif;
              }

              .game-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
              }

              .game {
                width: 200px;
                text-align: center;
                background-color: #f9f9f9;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 10px;
              }

              .product-image {
                width: 100%;
                height: 200px;
                object-fit: contain;
                border-radius: 8px;
                background-color: #f5f5f5;
              }

              .game strong {
                display: block;
                font-size: 16px;
                font-weight: bold;
                margin-top: 10px;
              }
            </style>
        `;

        const content: string = games
            .map((game: Game): string => {
                const imageUrl: string =
                    typeof game.images === "string" && game.images.length > 0
                        ? game.images.split(",")[0].trim()
                        : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

                const gameTitle: string = game.title;

                return `
                    <div class="game">
                        <img class="product-image" src="${imageUrl}" alt="${gameTitle}" />
                        <strong>${gameTitle}</strong>
                    </div>
                `;
            })
            .join("");

        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = style + `<div class="game-container">${content}</div>`;
    }
}

customElements.define("game-list", GameList);
