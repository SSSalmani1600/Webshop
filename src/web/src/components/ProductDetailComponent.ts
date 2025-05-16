import type { Game } from "@api/types/Game"; // or correct path

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
            const response: Response = await fetch(`/api/game?id=${gameId}`);
            if (!response.ok) throw new Error("Kon game niet ophalen.");

            const game: Game = await response.json() as Game;
            this.renderGame(game);
        }
        catch (error) {
            this.shadow.innerHTML = `<p style="color: red;">Fout: ${(error as Error).message}</p>`;
        }
    }

    private renderGame(game: {
        title: string;
        thumbnail: string;
        descriptionHtml: string;
        price?: number | null;
    }): void {
        const price: string = game.price !== undefined && game.price !== null
            ? `$${game.price}`
            : "N/B";

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
          font-family: Arial, sans-serif;
        }

        h2 {
          font-size: 32px;
          margin: 0 0 10px 0;
        }

        .price-top {
          position: absolute;
          top: 40px;
          right: 40px;
          color: #ccc;
          font-size: 16px;
        }

        img {
          width: 100%;
          max-width: 700px;
          border-radius: 12px;
          margin: 30px 0;
          display: block;
        }

        .info-boxes {
          display: flex;
          gap: 20px;
          margin-top: 20px;
        }

        .box {
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px;
          flex: 1;
          background-color: #1a1a1a;
        }

        .box h3 {
          margin-top: 0;
        }

        .tags {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .tag {
          background-color: #222;
          border: 1px solid #444;
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 12px;
        }

        .bottom-bar {
          margin-top: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .add-button {
          background-color: #7f41f5;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 999px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .add-button:hover {
          background-color: #6936cc;
        }

        .price-bottom {
          font-size: 20px;
        }
      </style>

      <div class="price-top">Price<br><strong>${price}</strong></div>

        `;
    }
}
