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
 * Een component die de gepersonaliseerde welkomst toont in de hero sectie
 */
export class WelcomeUserComponent extends HTMLElement {
    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public async connectedCallback(): Promise<void> {
        try {
            const response: Response = await fetch(`${VITE_API_URL}welcome-user`, {
                credentials: "include",
            });

            if (!response.ok) {
                console.error("Error fetching welcome message:", response.status);
                this.renderDefault();
                return;
            }

            const welcomeData: WelcomeUserResponse = await response.json() as WelcomeUserResponse;

            if (!welcomeData.success) {
                this.renderDefault();
                return;
            }

            this.render(welcomeData);
        }
        catch (error) {
            console.error("Welcome component error:", error);
            this.renderDefault();
        }
    }

    private renderDefault(): void {
        if (!this.shadowRoot) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .subtitle-text {
                    font-size: 3.5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    margin: 0;
                    color: #ffffff;
                }
                
                @media (max-width: 1024px) {
                    .subtitle-text {
                        font-size: 2.8rem;
                    }
                }
                
                @media (max-width: 768px) {
                    .subtitle-text {
                        font-size: 2.2rem;
                    }
                }
                
                @media (max-width: 480px) {
                    .subtitle-text {
                        font-size: 1.8rem;
                    }
                }
            </style>
            <h1 class="subtitle-text">Jouw Game Paradise! 🎮</h1>
        `;
    }

    private render(welcomeData: WelcomeUserResponse): void {
        if (!this.shadowRoot) return;

        if (welcomeData.isLoggedIn && welcomeData.username) {
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                    }
                    .subtitle-text {
                        font-size: 3.5rem;
                        font-weight: 800;
                        line-height: 1.1;
                        margin: 0;
                        color: #ffffff;
                    }
                    
                    @media (max-width: 1024px) {
                        .subtitle-text {
                            font-size: 2.8rem;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        .subtitle-text {
                            font-size: 2.2rem;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .subtitle-text {
                            font-size: 1.8rem;
                        }
                    }
                </style>
                <h1 class="subtitle-text">${welcomeData.username} zijn Game Paradise! 🎮</h1>
            `;
        }
        else {
            this.renderDefault();
        }
    }
}

customElements.define("welcome-user", WelcomeUserComponent);
