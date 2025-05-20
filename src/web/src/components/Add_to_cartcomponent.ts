import { WebshopEventService } from "../services/WebshopEventService";
import { AddToCartService } from "../services/add_to_cart_service";
import { WebshopEvent } from "../enums/WebshopEvent";

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
    private _addToCartService: AddToCartService = new AddToCartService();
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
        this._button.style.backgroundColor = "#4CAF50";
        this._button.style.color = "white";
        this._button.style.padding = "8px 16px";
        this._button.style.border = "none";
        this._button.style.borderRadius = "4px";
        this._button.style.cursor = "pointer";
        this._button.style.margin = "10px 0";

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

            const result: AddToCartResult = await this._addToCartService.addToCart(this._gameId, 1, this._price);

            if (result.success) {
                this.showNotification("✅ Toegevoegd aan winkelmandje", "success");
                this._eventService.dispatchEvent(WebshopEvent.AddToCart, {
                    gameId: this._gameId,
                    quantity: 1,
                    price: this._price,
                });
            }
            else {
                // Als er een foutmelding is, bijvoorbeeld niet ingelogd
                if (result.message === "User not logged in") {
                    window.location.href = "/login.html";
                    return;
                }

                this.showNotification(result.message || "Er is een fout opgetreden", "error");
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
        const notification: HTMLDivElement = document.createElement("div");
        notification.textContent = message;
        notification.style.position = "fixed";
        notification.style.top = "20px";
        notification.style.right = "20px";
        notification.style.padding = "10px 20px";
        notification.style.borderRadius = "4px";
        notification.style.zIndex = "1000";

        if (type === "success") {
            notification.style.backgroundColor = "#4CAF50";
            notification.style.color = "white";
        }
        else {
            notification.style.backgroundColor = "#f44336";
            notification.style.color = "white";
        }

        document.body.appendChild(notification);

        // Verwijder de notificatie na 3 seconden
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Registreer het component
customElements.define("add-to-cart", AddToCartComponent);
