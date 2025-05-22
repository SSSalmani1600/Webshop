import type { Game } from "@api/types/Game";
import { SessionResponse } from "@shared/types";

export class GameDetailComponent extends HTMLElement {
    private shadow: ShadowRoot;

    public constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.renderLoading();
        void this.loadGame();
    }

    private renderLoading(): void {
        this.shadow.innerHTML = "<p style=\"color: white;\">Game wordt geladen...</p>";
    }

    private async loadGame(): Promise<void> {
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        const gameId: string | null = urlParams.get("id");

        if (!gameId) {
            this.shadow.innerHTML = "<p style=\"color: red;\">Geen game ID opgegeven.</p>";
            return;
        }

        try {
            // Retrieve session ID
            const sessionId: string = await this.getSession();

            const response: Response = await fetch(`${VITE_API_URL}game?id=${gameId}`, {
                headers: {
                    "x-session": sessionId,
                },
            });
            console.log(response);
            if (!response.ok) throw new Error("Kon game niet ophalen.");

            const game: Game = await response.json() as Game;
            this.renderGame(game);
        }
        catch (error) {
            this.shadow.innerHTML = `<p style="color: red;">Fout: ${(error as Error).message}</p>`;
        }
    }

    // Retrieve a session ID from the backend
    private async getSession(): Promise<string> {
        const res: Response = await fetch(`${VITE_API_URL}session`);
        const data: unknown = await res.json();

        // Validate and return the session ID
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

    private renderGame(game: {
        title: string;
        thumbnail: string;
        descriptionHtml: string;
        price?: number | null;
    }): void {
        this.shadow.innerHTML = `
            <style>
            * {
            box-sizing: border-box;
            }

            :host {
            display: block;
            padding: 40px;
            background-color: #0f0f0f;
            color: white;
            font-family: 'Inter', sans-serif;
            width: 100vw;         /* Full viewport width */
            min-height: 100vh;    /* Full viewport height */
            margin: 0;
            box-sizing: border-box;
            overflow-x: hidden;   /* Prevent horizontal scroll */
            }

            html, body {
            margin: 0;
            padding: 0;
            background-color: #0f0f0f;
            overflow-x: hidden;
            }

            h2 {
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 10px 0;
            }

            .price-top {
            position: absolute;
            top: 40px;
            right: 40px;
            color: #aaa;
            font-size: 16px;
            }

            img {
            width: 100%;
            max-width: 800px;
            border-radius: 12px;
            margin: 40px auto 20px auto;
            display: block;
            }

            .info-boxes {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-top: 20px;
            }

            .box {
            background-color: #141414;
            border: 1px solid #2a2a2a;
            border-radius: 16px;
            padding: 20px;
            flex: 1;
            min-width: 300px;
            overflow: visible;        
            height: auto;              
            }

            .box h3 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 16px;
            }

            .box p {
            font-size: 14px;
            color: #ccc;
            line-height: 1.5;
            }

            .tags {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            flex-wrap: wrap;
            }

            .tag {
            background-color: #1c1c1c;
            border: 1px solid #333;
            border-radius: 999px;
            padding: 6px 16px;
            font-size: 13px;
            color: #e0e0e0;
            }

            .bottom-bar {
            margin-top: 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            }

            .add-button {
            background-color: #7f41f5;
            color: white;
            border: none;
            padding: 16px 36px;
            border-radius: 999px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(127, 65, 245, 0.4);
            transition: background 0.3s, box-shadow 0.3s;
            }

            .add-button:hover {
            background-color: #6936cc;
            box-shadow: 0 6px 16px rgba(105, 54, 204, 0.6);
            }

            .price-bottom {
            font-size: 20px;
            font-weight: 500;
            }

      </style>

      <h2>Game:<br><strong>${game.title}</strong></h2>

        <img src="${game.thumbnail}" alt="${game.title}" />

        <div class="info-boxes">
        <div class="box">
            <h3>Description</h3>
            ${game.descriptionHtml}
            <div class="tags">
            <div class="tag">Single player</div>
            <div class="tag">Horror</div>
            <div class="tag">Offline</div>
            </div>
        </div>
        <div class="box">
            <p><em>${game.title}</em> is a click and point based game.</p>
        </div>
        </div>

        <div class="bottom-bar">
        <button class="add-button">Toevoegen aan winkelmand</button>
        <div class="price-bottom">${game.price !== undefined && game.price !== null ? `$${game.price}` : "N/B"}</div>
        </div>



        `;
    }
}

customElements.define("game-detail-page", GameDetailComponent);
