import type { Game } from "../../../api/src/types/Game";
import type { GamePrices } from "../../../api/src/types/GamePrices";

// Interface representing the response structure for a session
interface SessionResponse {
    sessionId: string;
}

// Define a custom web component named GameList
export class GameList extends HTMLElement {
    public constructor() {
        super();
        // Attach a shadow DOM for encapsulation
        this.attachShadow({ mode: "open" });
    }

    // Called when the component is inserted into the DOM
    public async connectedCallback(): Promise<void> {
        console.log("GameList component is connected.");

        try {
            // Retrieve session ID
            const sessionId: string = await this.getSession();

            // Fetch the list of games
            const res: Response = await fetch(`${VITE_API_URL}/products`, {
                headers: {
                    "x-session": sessionId,
                },
            });

            // Handle fetch error
            if (!res.ok) {
                console.error("Error fetching games:", res.status);
                this.renderError(`Error fetching games: ${res.status}`);
                return;
            }

            // Parse the games JSON response
            const games: Game[] = (await res.json()) as Game[];
            console.log("Fetched games:", games);

            // If no games found, show error
            if (games.length === 0) {
                this.renderError("No games found.");
                return;
            }

            // Render the game list
            await this.render(games);
        }
        catch (error) {
            console.error("An error occurred:", error);
            this.renderError("An unexpected error occurred.");
        }
    }

    // Fetch the price for a specific game by its ID
    private async fetchGamePrice(gameId: number): Promise<number | null> {
        try {
            const sessionId: string = await this.getSession();
            const res: Response = await fetch(`${VITE_API_URL}/product-prices/${gameId}`, {
                headers: {
                    "x-session": sessionId,
                },
            });

            const data: GamePrices[] = (await res.json()) as GamePrices[];

            // Return the first price found, or null
            return data[0]?.price ?? null;
        }
        catch (error) {
            console.error(`Error fetching price for game ${gameId}:`, error);
            return null;
        }
    }

    // Retrieve a session ID from the backend
    private async getSession(): Promise<string> {
        const res: Response = await fetch(`${VITE_API_URL}/session`);
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

    // Render an error message to the shadow DOM
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

    // Render the list of games, including price and image
    private async render(games: Game[]): Promise<void> {
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

              .price {
                margin-top: 5px;
                color: #333;
                font-size: 14px;
                margin-bottom: 10px;
              }
              
              /* Zorg ervoor dat knop styling in de shadow DOM werkt */
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
              
              add-to-cart button:hover {
                background-color: #45a049;
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
                transition: background 0.3s;
                }

              .view-button:hover {
                background-color: #6936cc;
                }
                
            </style>
        `;

        // Fetch the price for each game and merge it into the game object
        const gamesWithPrices: Game[] = await Promise.all(
            games.map(async game => {
                const price: number | null = await this.fetchGamePrice(game.id);
                return { ...game, price };
            })
        );

        console.log("Games with prices:", gamesWithPrices);

        // Generate HTML content for each game
        const content: string = gamesWithPrices
            .map(game => {
                const imageUrl: string =
                    typeof game.images === "string" && game.images.length > 0
                        ? game.images.split(",")[0].trim()
                        : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

                const gameTitle: string = game.title;

                console.log("Game Price:", game.price);
                const price: string = game.price !== null && game.price !== undefined
                    ? `€ ${game.price.toFixed(2)}`
                    : "Price unknown";

                return `
                    <div class="game">
                        <img class="product-image" src="${imageUrl}" alt="${gameTitle}" />
                        <strong>${gameTitle}</strong>
                        <div class="price">${price}</div>

                        <a class="view-button" href="gameDetail.html?id=3">Bekijk game</a>
                        <add-to-cart game-id="${game.id}" price="${game.price !== null ? game.price : 0}"></add-to-cart>
                    </div>
                `;
            })
            .join("");

        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = style + `<div class="game-container">${content}</div>`;
    }
}

// Register the custom element so it can be used in HTML
customElements.define("game-list", GameList);
