import type { Game } from "../../../api/src/types/Game";
import type { GamePrices } from "../../../api/src/types/GamePrices";
import "@web/components/AddToWishlistComponent";

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
            const sessionId = await this.getSession();
            const res = await fetch(`${VITE_API_URL}products`, {
                headers: {
                    "x-session": sessionId,
                },
            });

            if (!res.ok) {
                this.renderError(`Error fetching games: ${res.status}`);
                return;
            }

            this.games = await res.json() as Game[];
            if (this.games.length === 0) {
                this.renderError("No games found.");
                return;
            }

            await this.render(this.games);
        } catch (error) {
            this.renderError("An unexpected error occurred.");
        }
    }

    private async fetchGamePrice(gameId: number): Promise<number | null> {
        try {
            const sessionId = await this.getSession();
            const res = await fetch(`${VITE_API_URL}product-prices/${gameId}`, {
                headers: {
                    "x-session": sessionId,
                },
            });

            const data = await res.json() as GamePrices[];
            return data[0]?.price ?? null;
        } catch {
            return null;
        }
    }

    private async getSession(): Promise<string> {
        const res = await fetch(`${VITE_API_URL}session`);
        const data = await res.json();

        if (typeof data === "object" && data !== null && "sessionId" in data) {
            return data.sessionId;
        }

        throw new Error("Invalid session object");
    }

    private renderError(message: string): void {
        const style = `
            <style>
              :host {
                display: block;
                padding: 20px;
                font-family: Arial, sans-serif;
              }

              p {
                color: red;
                font-size: 18px;
              }
            </style>
        `;

        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = style + `<p>${message}</p>`;
    }

    private getUniqueGenres(): string[] {
        const genres = new Set<string>();
        this.games.forEach(game => {
            if (game.genre) {
                game.genre.split(',').forEach(g => genres.add(g.trim()));
            }
        });
        return Array.from(genres).sort();
    }

    private filterGamesByGenres(games: Game[]): Game[] {
        if (this.selectedGenres.size === 0) return games;

        return games.filter(game => {
            const gameGenres = game.genre?.split(',').map(g => g.trim()) || [];
            return gameGenres.some(g => this.selectedGenres.has(g));
        });
    }

    private handleGenreChange(event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        if (checkbox.checked) {
            this.selectedGenres.add(checkbox.value);
        } else {
            this.selectedGenres.delete(checkbox.value);
        }
        this.render(this.games);
    }

    private async render(games: Game[]): Promise<void> {
        const style = `
            <style>
              :host {
                display: block;
                padding: 20px;
                font-family: Arial, sans-serif;
              }

              .genre-filter {
                margin-bottom: 20px;
                padding: 10px;
                background-color: #f5f5f5;
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

              .price {
                margin-top: 5px;
                color: #333;
                font-size: 14px;
                margin-bottom: 10px;
              }

              add-to-cart {
                display: block;
                margin: 10px 0;
              }

              add-to-cart button {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                width: 100%;
                font-size: 14px;
              }

              .view-button {
                display: inline-block;
                margin-top: 10px;
                padding: 8px 16px;
                background-color: #7f41f5;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-size: 14px;
              }
            </style>
        `;

        const visibleGames = games.filter(g => !g.hidden);
        const filteredGames = this.filterGamesByGenres(visibleGames);
        const gamesWithPrices = await Promise.all(
            filteredGames.map(async game => {
                const price = await this.fetchGamePrice(game.id);
                return { ...game, price };
            })
        );

        const genres = this.getUniqueGenres();
        const genreFilter = `
            <div class="genre-filter">
              ${genres.map(genre => `
                <div class="genre-checkbox">
                  <input type="checkbox" id="genre-${genre}" value="${genre}" ${this.selectedGenres.has(genre) ? 'checked' : ''} />
                  <label for="genre-${genre}">${genre}</label>
                </div>
              `).join('')}
            </div>
        `;

        const content = gamesWithPrices.map(game => {
            const imageUrl = game.images?.split(",")[0]?.trim() || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
            const price = game.price !== null ? `€ ${game.price.toFixed(2)}` : "Price unknown";
            return `
                <div class="game">
                    <img class="product-image" src="${imageUrl}" alt="${game.title}" />
                    <strong>${game.title}</strong>
                    <div class="price">${price}</div>
                    <div class="game-actions">
                        <a class="view-button" href="gameDetail.html?id=${game.id}">Bekijk game</a>
                        <add-to-wishlist game-id="${game.id}"></add-to-wishlist>
                    </div>
                    <add-to-cart game-id="${game.id}" price="${game.price ?? 0}"></add-to-cart>
                </div>
            `;
        }).join("");

        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = style + genreFilter + `<div class="game-container">${content}</div>`;

        // bind events to new checkboxes
        const checkboxes = this.shadowRoot.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', e => this.handleGenreChange(e));
        });
    }
}

customElements.define("game-list", GameList);
