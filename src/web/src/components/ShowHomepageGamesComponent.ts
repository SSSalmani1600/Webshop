import type { Game } from "../../../api/src/types/Game";
import type { GamePrices } from "../../../api/src/types/GamePrices";

// Interface voor de API response van homepage games
interface HomepageGamesResponse {
    success: boolean;
    data: Game[];
}

// Interface voor de session response
interface SessionResponse {
    sessionId: string;
}

// Declare VITE_API_URL as it comes from environment variables
declare const VITE_API_URL: string;

/**
 * Component voor het tonen van homepage games
 * Een webcomponent die uitgelichte games toont op de homepage
 * @element homepage-games
 */
export class ShowHomepageGamesComponent extends HTMLElement {
    public constructor() {
        super();
        // Attach een shadow DOM voor encapsulation
        this.attachShadow({ mode: "open" });
    }

    /**
     * Wordt aangeroepen wanneer het element aan de DOM wordt toegevoegd
     * Initialiseert de component door games op te halen en te renderen
     */
    public async connectedCallback(): Promise<void> {
        console.log("ShowHomepageGamesComponent is connected.");

        try {
            // Haal session ID op
            const sessionId: string = await this.getSession();

            // Haal de homepage games op
            const res: Response = await fetch(`${VITE_API_URL}homepage-games`, {
                headers: {
                    "x-session": sessionId,
                },
            });

            // Handle fetch error
            if (!res.ok) {
                console.error("Error fetching homepage games:", res.status);
                this.renderError(`Error fetching homepage games: ${res.status}`);
                return;
            }

            // Parse de JSON response
            const response: HomepageGamesResponse = (await res.json()) as HomepageGamesResponse;
            console.log("Fetched homepage games:", response);

            // Controleer of de response succesvol is
            if (!response.success || response.data.length === 0) {
                this.renderError("No featured games found.");
                return;
            }

            // Render de games
            await this.render(response.data);
        }
        catch (error) {
            console.error("An error occurred:", error);
            this.renderError("An unexpected error occurred.");
        }
    }

    /**
     * Haalt de prijs op voor een specifieke game
     * @param gameId - Het ID van de game
     * @returns De prijs van de game of null als deze niet kan worden opgehaald
     */
    private async fetchGamePrice(gameId: number): Promise<number | null> {
        try {
            const sessionId: string = await this.getSession();
            const res: Response = await fetch(`${VITE_API_URL}product-prices/${gameId}`, {
                headers: {
                    "x-session": sessionId,
                },
            });

            const data: GamePrices[] = (await res.json()) as GamePrices[];

            // Return de eerste prijs die gevonden wordt, of null
            return data[0]?.price ?? null;
        }
        catch (error) {
            console.error(`Error fetching price for game ${gameId}:`, error);
            return null;
        }
    }

    /**
     * Haalt een session ID op van de backend
     * @returns Een Promise met de session ID
     */
    private async getSession(): Promise<string> {
        const res: Response = await fetch(`${VITE_API_URL}session`);
        const data: unknown = await res.json();

        // Valideer en return de session ID
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

    /**
     * Render een error message naar de shadow DOM
     * @param message - De error message om te tonen
     */
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

    /**
     * Render de lijst van homepage games, inclusief prijs en afbeelding
     * @param games - Array van Game objecten om te renderen
     */
    private async render(games: Game[]): Promise<void> {
        const style: string = `
            <style>
              :host {
                display: block;
                padding: 20px;
                font-family: Arial, sans-serif;
              }

              .games-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                max-width: 1200px;
                margin: 0 auto;
              }

              .game-card {
                background-color: #f9f9f9;
                border-radius: 12px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                padding: 15px;
                text-align: center;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
              }

              .game-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
              }

              .game-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 8px;
                background-color: #f5f5f5;
                margin-bottom: 10px;
              }

              .game-title {
                font-size: 16px;
                font-weight: bold;
                margin: 10px 0 5px 0;
                color: #333;
              }

              .game-price {
                color: #666;
                font-size: 14px;
                margin-bottom: 15px;
              }

              .game-button {
                background-color: #7f41f5;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background-color 0.3s ease;
                width: 100%;
                margin-bottom: 10px;
              }

              .game-button:hover {
                background-color: #6936cc;
              }


            </style>
        `;

        // Haal de prijs op voor elke game en merge het in het game object
        const gamesWithPrices: Game[] = await Promise.all(
            games.map(async game => {
                const price: number | null = await this.fetchGamePrice(game.id);
                return { ...game, price };
            })
        );

        console.log("Homepage games with prices:", gamesWithPrices);

        // Genereer HTML content voor elke game
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
                    <div class="game-card">
                        <img class="game-image" src="${imageUrl}" alt="${gameTitle}" />
                        <h3 class="game-title">${gameTitle}</h3>
                        <div class="game-price">${price}</div>
                        <button class="game-button" onclick="window.location.href='gameDetail.html?id=${game.id}'">
                            Bekijk Game
                        </button>
                    </div>
                `;
            })
            .join("");

        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = style + `<div class="games-grid">${content}</div>`;
    }
}

// Registreer het custom element zodat het gebruikt kan worden in HTML
customElements.define("homepage-games", ShowHomepageGamesComponent);
