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
    private _price: number = 0;
    private _eventService: WebshopEventService = new WebshopEventService();
    private _button: HTMLButtonElement | null = null;

    /**
     * Initialiseer het component
     */
    public constructor() {
        super();
    }

    /**
     * Wordt aangeroepen als het element aan de DOM wordt toegevoegd
     */
    public connectedCallback(): void {
        this.render();
        this.setupEventListeners();
    }

    /**
     * Geeft de te observeren attributen terug
     */
    public static get observedAttributes(): string[] {
        return ["game-id", "price"];
    }

    /**
     * Handelt wijzigingen in attributen af
     */
    public attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
        if (name === "game-id") {
            this._gameId = parseInt(newValue, 10);
        }
        else if (name === "price") {
            this._price = parseFloat(newValue);
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
     * Zet event listeners op
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

                // Direct API call zoals in LoginComponent
            const response: Response = await fetch(`${VITE_API_URL}cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    game_id: this._gameId,
                    quantity: 1,
                    price: this._price,
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
                this._eventService.dispatchEvent(WebshopEvent.AddToCart, {
                    gameId: this._gameId,
                    quantity: 1,
                    price: this._price,
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
     * Toon een notificatie
     */
    private showNotification(message: string, type: "success" | "error"): void {
        // Verwijder bestaande notificaties eerst
        const existingNotifications: NodeListOf<Element> = document.querySelectorAll(".cart-notification");
        existingNotifications.forEach(notification => notification.remove());

        const notification: HTMLDivElement = document.createElement("div");
        notification.textContent = message;
        notification.className = "cart-notification";
        notification.style.position = "fixed";
        notification.style.top = "20px";
        notification.style.right = "20px";
        notification.style.padding = "15px 25px";
        notification.style.borderRadius = "8px";
        notification.style.zIndex = "1000";
        notification.style.transition = "all 0.3s ease";
        notification.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        notification.style.fontWeight = "500";

        if (type === "success") {
            notification.style.backgroundColor = "#6B46C1"; // Paarse kleur voor success
            notification.style.color = "white";
        }
        else {
            notification.style.backgroundColor = "#E53E3E"; // Rode kleur voor errors
            notification.style.color = "white";
        }

        document.body.appendChild(notification);

        // Voeg een fade-in animatie toe
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-20px)";
        // Trigger de animatie
        setTimeout(() => {
            notification.style.opacity = "1";
            notification.style.transform = "translateY(0)";
        }, 10);

        // Verwijder de notificatie na 3 seconden met een fade-out effect
        setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transform = "translateY(-20px)";
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Registreer het component
customElements.define("add-to-cart", AddToCartComponent);
