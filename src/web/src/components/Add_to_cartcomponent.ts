import { WebshopEventService } from "../services/WebshopEventService";
import { WebshopEvent } from "../enums/WebshopEvent";

// Declare VITE_API_URL as it comes from environment variables
declare const VITE_API_URL: string;

/**
 * Response van de actie om toe te voegen aan het winkelmandje
 */
interface AddToCartResult {
    success: boolean;
    message?: string;
}

/**
 * Component voor het toevoegen van een game aan het winkelmandje
 */
export class AddToCartComponent extends HTMLElement {
    private _gameId: number = 0;
    private _eventService: WebshopEventService = new WebshopEventService();
    private _button: HTMLButtonElement | null = null;

    /**
     * Initialiseer het component
     */
    public constructor() {
        super();
    }

    /**
     * Wordt aangeroepen wanneer het element aan de DOM wordt toegevoegd
     */
    public connectedCallback(): void {
        this.render();
        this.setupEventListeners();
    }

    /**
     * Geef aan welke attributen we willen observeren
     */
    public static get observedAttributes(): string[] {
        return ["game-id"];
    }

    /**
     * Handelt wijzigingen in attributen af
     */
    public attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
        if (name === "game-id") {
            this._gameId = parseInt(newValue, 10);
        }
    }

    /**
     * Render het component
     */
    private render(): void {
        this._button = document.createElement("button");
        this._button.textContent = "Voeg toe aan winkelmandje";
        this._button.className = "add-to-cart-button";
        this._button.style.backgroundColor = "#6B46C1";
        this._button.style.color = "white";
        this._button.style.padding = "8px 16px";
        this._button.style.border = "none";
        this._button.style.borderRadius = "4px";
        this._button.style.cursor = "pointer";
        this._button.style.margin = "10px 0";
        this._button.style.transition = "background-color 0.3s ease";

        this._button.addEventListener("mouseover", () => {
            this._button!.style.backgroundColor = "#553C9A";
        });
        this._button.addEventListener("mouseout", () => {
            this._button!.style.backgroundColor = "#6B46C1";
        });

        this.appendChild(this._button);
    }

    /**
     * Stel event listeners in
     */
    private setupEventListeners(): void {
        this._button?.addEventListener("click", this.handleAddToCart.bind(this));
    }

    /**
     * Handelt het klikken op de knop af
     */
    private async handleAddToCart(e: Event): Promise<void> {
        e.preventDefault();

        try {
            // Controleer of het game ID geldig is
            if (!this._gameId) {
                this.showNotification("Geen geldig game ID gevonden", "error");
                return;
            }

            // API call zonder prijs - prijs wordt server-side opgehaald
            const response: Response = await fetch(`${VITE_API_URL}cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    game_id: this._gameId,
                    quantity: 1,
                }),
                credentials: "include",
            });

            const data: AddToCartResult = await response.json() as AddToCartResult;

            if (!response.ok) {
                if (response.status === 401) {
                    this.showNotification("Gebruiker niet ingelogd", "error");
                    window.location.href = "/login.html";
                    return;
                }
                this.showNotification(data.message || `Fout: ${response.statusText}`, "error");
                return;
            }

            if (data.success) {
                this.showNotification("✅ Toegevoegd aan winkelmandje", "success");
                document.dispatchEvent(new CustomEvent("cart-updated"));
                this._eventService.dispatchEvent(WebshopEvent.AddToCart, {
                    gameId: this._gameId,
                    quantity: 1,
                });
            }
            else {
                this.showNotification(data.message || "Er is een fout opgetreden", "error");
            }
        }
        catch (error) {
            console.error("Fout bij toevoegen aan winkelmandje:", error);
            this.showNotification("Er is een fout opgetreden bij het toevoegen aan winkelmandje", "error");
        }
    }

    /**
     * Toon een notificatie aan de gebruiker
     */
    private showNotification(message: string, type: "success" | "error"): void {
        // Maak een notificatie element
        const notification: HTMLDivElement = document.createElement("div");
        notification.textContent = message;
        notification.style.position = "fixed";
        notification.style.top = "20px";
        notification.style.right = "20px";
        notification.style.padding = "10px 15px";
        notification.style.borderRadius = "4px";
        notification.style.color = "white";
        notification.style.fontSize = "14px";
        notification.style.zIndex = "1000";
        notification.style.maxWidth = "300px";
        notification.style.wordWrap = "break-word";

        if (type === "success") {
            notification.style.backgroundColor = "#10B981";
        } else {
            notification.style.backgroundColor = "#EF4444";
        }

        // Voeg toe aan de body
        document.body.appendChild(notification);

        // Verwijder na 3 seconden
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Registreer het custom element
customElements.define("add-to-cart", AddToCartComponent);
