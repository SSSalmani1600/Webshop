// Interface voor de random game API response
interface RandomGameApiResponse {
    success: boolean;
    message: string;
    game?: {
        id: number;
        title: string;
        thumbnail?: string;
    };
    totalGames?: number;
}

// Declare VITE_API_URL as it comes from environment variables
declare const VITE_API_URL: string;

/**
 * Random Game Component
 * Een webcomponent die een "Verras mij" knop toont
 * Bij klikken wordt er een willekeurige game gekozen en doorverwezen
 * @element random-game
 */
export class RandomGameComponent extends HTMLElement {
    private isLoading: boolean = false;

    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    /**
     * Wordt aangeroepen wanneer het element aan de DOM wordt toegevoegd
     */
    public connectedCallback(): void {
        this.render();
        this.attachEventListeners();
    }

    /**
     * Rendert de component HTML en styling
     */
    private render(): void {
        if (!this.shadowRoot) {
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 8rem 0;
                }

                .random-game-container {
                    text-align: center;
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .random-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: white;
                    margin: 0 0 0.75rem 0;
                }

                .random-description {
                    color: rgba(255, 255, 255, 0.9);
                    margin: 0 0 1.5rem 0;
                    font-size: 0.95rem;
                    line-height: 1.4;
                }

                .random-button {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 500;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    min-width: 160px;
                }

                .random-button:hover:not(:disabled) {
                    background: #0056b3;
                }

                .random-button:disabled {
                    background: rgba(255, 255, 255, 0.3);
                    cursor: not-allowed;
                }

                .loading-spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                    margin-right: 6px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .game-count {
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 0.85rem;
                    margin-top: 1rem;
                }

                @media (max-width: 768px) {
                    .random-game-container {
                        margin: 0 1rem;
                        padding: 1.25rem;
                    }
                    
                    .random-title {
                        font-size: 1.2rem;
                    }
                    
                    .random-button {
                        padding: 0.7rem 1.25rem;
                        min-width: 140px;
                    }
                }
            </style>
            
            <div class="random-game-container">
                <h3 class="random-title">🎲 Voel je avontuurlijk?</h3>
                <p class="random-description">
                    Laat ons een willekeurige game voor je kiezen!
                </p>
                <button class="random-button" id="randomButton">
                    🎯 Verras mij!
                </button>
                <div class="game-count" id="gameCount"></div>
            </div>
        `;
    }

    /**
     * Voegt event listeners toe aan de knop
     */
    private attachEventListeners(): void {
        const button: HTMLButtonElement = this.shadowRoot!.querySelector("#randomButton") as HTMLButtonElement;
        button.addEventListener("click", () => this.handleRandomGame());
    }

    /**
     * Handelt de "Verras mij" functionaliteit af
     * Haalt een willekeurige game op en navigeert ernaar
     */
    private async handleRandomGame(): Promise<void> {
        if (this.isLoading) {
            return;
        }

        const button: HTMLButtonElement = this.shadowRoot!.querySelector("#randomButton") as HTMLButtonElement;
        const gameCountDiv: HTMLDivElement = this.shadowRoot!.querySelector("#gameCount") as HTMLDivElement;

        try {
            this.setLoadingState(button, true);

            const apiUrl: string = typeof VITE_API_URL !== "undefined" ? VITE_API_URL : "http://localhost:3001/";
            const response: Response = await fetch(`${apiUrl}games/random`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: RandomGameApiResponse = await response.json() as RandomGameApiResponse;

            if (!data.success || !data.game) {
                throw new Error(data.message || "Geen game gevonden");
            }

            // Toon succes en navigeer
            button.innerHTML = `🎉 ${data.game.title}!`;

            if (data.totalGames) {
                gameCountDiv.textContent = `Gekozen uit ${data.totalGames} beschikbare games`;
            }

            setTimeout(() => {
                window.location.href = `/gameDetail.html?id=${data.game!.id}`;
            }, 1500);
        }
        catch (error: unknown) {
            console.error("Random game error:", error);
            button.innerHTML = "❌ Fout opgetreden";

            // Reset knop na 3 seconden
            setTimeout(() => {
                this.resetButton();
            }, 3000);
        }
    }

    private setLoadingState(button: HTMLButtonElement, loading: boolean): void {
        this.isLoading = loading;
        button.disabled = loading;
        if (loading) {
            button.innerHTML = "<span class=\"loading-spinner\"></span>Zoeken...";
        }
    }

    /**
     * Reset de knop naar de originele staat
     */
    private resetButton(): void {
        const button: HTMLButtonElement = this.shadowRoot!.querySelector("#randomButton") as HTMLButtonElement;

        button.disabled = false;
        button.innerHTML = "🎯 Verras mij!";
        this.isLoading = false;
    }
}

// Registreer de component als HTML element
window.customElements.define("random-game", RandomGameComponent);
