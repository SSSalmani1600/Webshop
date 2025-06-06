import type { Game } from "../../../api/src/types/Game";
import type { GamePrices } from "../../../api/src/types/GamePrices";
import "@web/components/AddToWishlistComponent";
import "@web/components/Add_to_cartcomponent";

interface SessionResponse {
    sessionId: string;
}

export class GameList extends HTMLElement {
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

            const games: Game[] = (await res.json()) as Game[];
            if (games.length === 0) {
                this.renderError("No games found.");
                return;
            }

            await this.render(games);
        }
        catch (error) {
            this.renderError("An unexpected error occurred.");
            console.error(error);
        }
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
        catch (error) {
            console.error(`Error fetching price for game ${gameId}:`, error);
            return null;
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

    private renderError(message: string): void {
        const style: string = `
      <style>
        :host {
          display: block;
          background-color: #0d0d0d;
          color: #fff;
          font-family: 'Inter', sans-serif;
          padding: 2rem;
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

    private async render(games: Game[]): Promise<void> {
        if (!this.shadowRoot) return;

        const visibleGames: Game[] = games.filter(game => !game.hidden);
        const gamesWithPrices: (Game & { price: number | null })[] = await Promise.all(
            visibleGames.map(async game => {
                const price: number | null = await this.fetchGamePrice(game.id);
                return { ...game, price };
            })
        );

        const style: string = `
     <style>
  :host {
    display: block;
    background-color: #0d0d0d;
    color: #fff;
    font-family: 'Inter', sans-serif;
    padding: 2rem;
  }

  .product-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 4rem;
    margin: 0 auto;
    max-width: 1200px;
  }

  .product-card {
    background-color: #111;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 1.2rem;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
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
    font-size: 1.1rem;
    margin-top: 0.5rem;
    display: block;
  }

  .price {
    margin: 8px 0;
    font-size: 1.1rem;
    color: #aaa;
  }

  .button-row {
    display: flex;
    gap: 8px;           /* Iets minder ruimte tussen knoppen */
    margin-top: 1rem;
    width: 100%;
    justify-content: center; /* Centraal uitlijnen van knoppen */
  }

  .action-button {
    background-color: #7f3df4;
    color: #fff;
    border: none;
    padding: 6px 12px;    
    border-radius: 6px;   
    cursor: pointer;
    font-size: 0.75rem;    
    text-decoration: none;
    transition: background-color 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;       
    min-width: 0;          
  }

  .action-button:hover {
    background-color: #9b5dfc;
  }
</style>

    `;

        const content: string = gamesWithPrices
            .map(game => {
                const imageUrl: string =
                    typeof game.images === "string" && game.images.length > 0
                        ? game.images.split(",")[0].trim()
                        : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

                const title: string = game.title;
                const priceLabel: string =
                    game.price !== null
                        ? `€ ${game.price.toFixed(2)}`
                        : "Onbekende prijs";

                return `
          <div class="product-card">
            <img class="product-image" src="${imageUrl}" alt="${title}" />
            <strong>${title}</strong>
            <div class="price">${priceLabel}</div>

            <div class="button-row">
              <a class="action-button" href="gameDetail.html?id=${game.id}">
                Bekijken
              </a>
              <add-to-wishlist class="action-button" game-id="${game.id}">
              </add-to-wishlist>
            </div>

            <add-to-cart
              game-id="${game.id}"
              price="${game.price ?? 0}"
            >
            </add-to-cart>
          </div>
        `;
            })
            .join("");

        this.shadowRoot.innerHTML = style + `<div class="product-list">${content}</div>`;
    }
}

customElements.define("game-list", GameList);
