import type { Game } from "../../../api/src/types/Game";
import type { GamePrices } from "../../../api/src/types/GamePrices";
import "@web/components/AddToWishlistComponent";
import "@web/components/Add_to_cartcomponent";

interface SessionResponse {
    sessionId: string;
}

export class GameList extends HTMLElement {
    private games: Game[] = [];
    private selectedGenres: Set<string> = new Set();

    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public async connectedCallback(): Promise<void> {
        try {
            const sessionId: string = await this.getSession();
            const res: Response = await fetch(`${VITE_API_URL}products`, {
                headers: { "x-session": sessionId },
            });

            if (!res.ok) {
                this.renderError(`Error fetching games: ${res.status}`);
                return;
            }

            this.games = (await res.json()) as Game[];
            if (this.games.length === 0) {
                this.renderError("No games found.");
                return;
            }

            await this.render();
        }
        catch (error) {
            console.error(error);
            this.renderError("An unexpected error occurred.");
        }
    }

    private async getSession(): Promise<string> {
        const res: Response = await fetch(`${VITE_API_URL}session`);
        const data: SessionResponse = (await res.json()) as SessionResponse;
        if (typeof data.sessionId === "string") {
            return data.sessionId;
        }
        throw new Error("Invalid session object");
    }

    private async fetchGamePrice(gameId: number): Promise<number | null> {
        try {
            const sessionId: string = await this.getSession();
            const res: Response = await fetch(`${VITE_API_URL}product-prices/${gameId}`, {
                headers: { "x-session": sessionId },
            });
            const data: GamePrices[] = (await res.json()) as GamePrices[];
            return data[0]?.price ?? null;
        }
        catch {
            return null;
        }
    }

    private getUniqueGenres(): string[] {
        const genres: Set<string> = new Set<string>();
        this.games.forEach(game => {
            game.genre
                ?.split(",")
                .map(g => g.trim())
                .forEach(g => genres.add(g));
        });
        return Array.from(genres).sort();
    }

    private filterGamesByGenres(games: Game[]): Game[] {
        if (this.selectedGenres.size === 0) return games;
        return games.filter(game => {
            const gameGenres: string[] = game.genre?.split(",").map(g => g.trim()) || [];
            return gameGenres.some(g => this.selectedGenres.has(g));
        });
    }

    private handleGenreChange(event: Event): void {
        const checkbox: HTMLInputElement = event.target as HTMLInputElement;
        if (checkbox.checked) {
            this.selectedGenres.add(checkbox.value);
        }
        else {
            this.selectedGenres.delete(checkbox.value);
        }
        void this.render();
    }

    private async render(): Promise<void> {
        if (!this.shadowRoot) return;

        const style: string = `
      <style>
        :host {
          display: block;
          background-color: #0d0d0d;
          color: #fff;
          font-family: 'Inter', sans-serif;
          padding: 2rem;
        }
        .genre-filter {
          margin-bottom: 20px;
          padding: 10px;
          background-color: #1a1a1a;
          border-radius: 8px;
        }
        .genre-checkbox {
          display: inline-block;
          margin-right: 10px;
          margin-bottom: 5px;
        }
        .genre-checkbox label {
          margin-left: 4px;
        }
        .product-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }
        .product-card {
          background-color: #111;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          transition: transform 0.2s ease;
        }
        .product-card:hover {
          transform: scale(1.02);
        }
        .product-image {
          width: 100%;
          height: 200px;
          object-fit: contain;
          border-radius: 8px;
          background-color: #0d0d0d;
        }
        .product-card strong {
          display: block;
          margin-top: 0.5rem;
          font-size: 1.1rem;
        }
        .price {
          margin: 0.5rem 0;
          font-size: 1rem;
          color: #aaa;
        }
        .button-row {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 1rem;
        }
        .action-button {
          background-color: #7f3df4;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .action-button:hover {
          background-color: #9b5dfc;
        }
      </style>
    `;

        // Filter and fetch prices
        const visibleGames: Game[] = this.games.filter(g => !g.hidden);
        const filteredGames: Game[] = this.filterGamesByGenres(visibleGames);
        const gamesWithPrices: Game[] = await Promise.all(
            filteredGames.map(async game => ({ ...game, price: await this.fetchGamePrice(game.id) }))
        );

        // Render genres
        const genres: string[] = this.getUniqueGenres();
        const genreFilter: string = `
      <div class="genre-filter">
        ${genres
            .map(
                genre => `
          <div class="genre-checkbox">
            <input type="checkbox" id="genre-${genre}" value="${genre}" ${this.selectedGenres.has(genre) ? "checked" : ""
                        } />
            <label for="genre-${genre}">${genre}</label>
          </div>
        `
            )
            .join("")}
      </div>
    `;

        // Render products
        const productList: string = gamesWithPrices
            .map(game => {
                const imageUrl: string =
                    typeof game.images === "string" && game.images
                        ? game.images.split(",")[0].trim()
                        : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                const priceLabel: string = (game.price ?? 0) > 0
                    ? `€ ${(game.price!).toFixed(2)}`
                    : "Onbekende prijs";
                return `
          <div class="product-card">
            <img class="product-image" src="${imageUrl}" alt="${game.title}" />
            <strong>${game.title}</strong>
            <div class="price">${priceLabel}</div>
            <div class="button-row">
              <a class="action-button" href="gameDetail.html?id=${game.id}">Bekijken</a>
              <add-to-wishlist class="action-button" game-id="${game.id}"></add-to-wishlist>
            </div>
            <add-to-cart game-id="${game.id}" price="${game.price ?? 0}"></add-to-cart>
          </div>
        `;
            })
            .join("");

        this.shadowRoot.innerHTML =
            style + genreFilter + `<div class="product-list">${productList}</div>`;

        // Bind checkbox events
        this.shadowRoot.querySelectorAll<HTMLInputElement>("input[type=\"checkbox\"]").forEach(checkbox => {
            checkbox.addEventListener("change", e => this.handleGenreChange(e));
        });
    }

    private renderError(message: string): void {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; padding: 20px; font-family: Arial, sans-serif; }
        p { color: red; font-size: 18px; font-weight: bold; }
      </style>
      <p>${message}</p>
    `;
    }
}

customElements.define("game-list", GameList);
