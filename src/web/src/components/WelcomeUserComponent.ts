// Interface voor de welcome API response
interface WelcomeUserResponse {
    success: boolean;
    message: string;
    isLoggedIn: boolean;
    username?: string;
}

// Declare VITE_API_URL as it comes from environment variables
declare const VITE_API_URL: string;

/**
 * Welcome User Component
 * Een webcomponent die een gepersonaliseerd welkomstbericht toont
 * @element welcome-user
 */
export class WelcomeUserComponent extends HTMLElement {
    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    /**
     * Wordt aangeroepen wanneer het element aan de DOM wordt toegevoegd
     * Haalt de welkomstdata op en rendert het bericht
     */
    public async connectedCallback(): Promise<void> {
        try {
            // Haal welkomstbericht op - gebruik bestaande login cookies
            const response: Response = await fetch(`${VITE_API_URL}welcome-user`, {
                credentials: "include", // Dit gebruikt de bestaande session cookie van login
            });

            if (!response.ok) {
                console.error("Error fetching welcome message:", response.status);
                this.renderError("Kon welkomstbericht niet ophalen");
                return;
            }

            const welcomeData: WelcomeUserResponse = await response.json() as WelcomeUserResponse;

            if (!welcomeData.success) {
                this.renderError("Fout bij ophalen welkomstbericht");
                return;
            }

            this.render(welcomeData);
        }
        catch (error) {
            console.error("Welcome component error:", error);
            this.renderError("Er is een fout opgetreden");
        }
    }

    /**
     * Rendert een foutmelding
     * @param message - De foutmelding om te tonen
     */
    private renderError(message: string): void {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    text-align: center;
                    padding: 1rem;
                    margin: 2rem auto;
                    max-width: 1200px;
                }
                .error {
                    color: #ff6b6b;
                    font-size: 1rem;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }
            </style>
            <div class="error">${message}</div>
        `;
    }

    /**
     * Rendert het welkomstbericht
     * @param welcomeData - De data van de API response
     */
    private render(welcomeData: WelcomeUserResponse): void {
        if (!this.shadowRoot) return;

        // Bepaal of we extra styling nodig hebben voor ingelogde gebruikers
        const userSpecificClass: string = welcomeData.isLoggedIn ? "logged-in" : "guest";
        const introText: string = welcomeData.isLoggedIn
            ? "Ontdek onze nieuwste games en vind je volgende favoriete game!"
            : "Meld je aan voor exclusieve toegang tot onze gamebibliotheek en speciale aanbiedingen!";

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    text-align: center;
                    padding: 3rem 1rem 2rem 1rem;
                    margin: 0 auto;
                    max-width: 1200px;
                    background: linear-gradient(135deg, rgba(128, 90, 213, 0.1) 0%, rgba(107, 70, 193, 0.05) 100%);
                    border-radius: 16px;
                    margin-bottom: 2rem;
                }

                .welcome-container {
                    max-width: 800px;
                    margin: 0 auto;
                }

                .welcome-message {
                    font-size: 2.5rem;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 1rem;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                }

                .welcome-intro {
                    font-size: 1.2rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: 2rem;
                    line-height: 1.6;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                .logged-in .welcome-message {
                    background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .guest .action-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .action-button {
                    background-color: #805ad5;
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    text-decoration: none;
                    display: inline-block;
                    transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
                }

                .action-button:hover {
                    background-color: #6b46c1;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
                }

                .action-button.secondary {
                    background-color: transparent;
                    border: 2px solid #805ad5;
                    color: #805ad5;
                }

                .action-button.secondary:hover {
                    background-color: #805ad5;
                    color: white;
                }

                @media (max-width: 768px) {
                    :host {
                        padding: 2rem 1rem;
                    }

                    .welcome-message {
                        font-size: 2rem;
                    }

                    .welcome-intro {
                        font-size: 1.1rem;
                    }

                    .action-buttons {
                        flex-direction: column;
                        align-items: center;
                    }

                    .action-button {
                        width: 100%;
                        max-width: 200px;
                    }
                }
            </style>
            <div class="welcome-container ${userSpecificClass}">
                <h1 class="welcome-message">${welcomeData.message}</h1>
                <p class="welcome-intro">${introText}</p>
                ${!welcomeData.isLoggedIn
                    ? `
                    <div class="action-buttons">
                        <a href="/login.html" class="action-button">Inloggen</a>
                        <a href="/register.html" class="action-button secondary">Account aanmaken</a>
                    </div>
                `
                    : ""}
            </div>
        `;
    }
}

// Registreer de component als HTML element
window.customElements.define("welcome-user", WelcomeUserComponent);
