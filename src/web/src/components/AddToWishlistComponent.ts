// Declare VITE_API_URL as it comes from environment variables
declare const VITE_API_URL: string;

/**
 * Response van de actie om toe te voegen aan favorieten
 */
interface AddToWishlistResult {
    success: boolean;
    message?: string;
}

interface WishlistItem {
    game_id: number;
}

/**
 * Component voor het toevoegen van een game aan favorieten
 */
export class AddToWishlistComponent extends HTMLElement {
    private _gameId: number = 0;
    private _button: HTMLButtonElement | null = null;
    private _isInWishlist: boolean = false;

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
        void this.checkWishlistStatus();
    }

    /**
     * Geeft de te observeren attributen terug
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
            void this.checkWishlistStatus();
        }
    }

    /**
     * Controleer of de game al in de wishlist zit
     */
    private async checkWishlistStatus(): Promise<void> {
        try {
            const response: Response = await fetch(`${VITE_API_URL}wishlist`, {
                credentials: "include",
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this._isInWishlist = false;
                    this.updateButtonStyle();
                    return;
                }
                throw new Error("Kon wishlist status niet ophalen");
            }

            const wishlistItems: WishlistItem[] = await response.json() as WishlistItem[];
            this._isInWishlist = wishlistItems.some(item => item.game_id === this._gameId);
            this.updateButtonStyle();
        }
        catch (error) {
            console.error("Fout bij controleren wishlist status:", error);
        }
    }

    /**
     * Render het component
     */
    private render(): void {
        this._button = document.createElement("button");
        this._button.innerHTML = "♥";
        this._button.className = "wishlist-button";
        this._button.style.backgroundColor = "transparent";
        this._button.style.border = "none";
        this._button.style.fontSize = "24px";
        this._button.style.cursor = "pointer";
        this._button.style.padding = "8px";
        this._button.style.transition = "color 0.3s ease";
        this._button.style.color = "#6B46C1";
        this._button.style.opacity = "0.7";

        this.appendChild(this._button);
        this.updateButtonStyle();
    }

    /**
     * Update de stijl van de knop
     */
    private updateButtonStyle(): void {
        if (!this._button) return;

        if (this._isInWishlist) {
            this._button.style.color = "#6B46C1";
            this._button.style.opacity = "1";
        }
        else {
            this._button.style.color = "#6B46C1";
            this._button.style.opacity = "0.7";
        }
    }

    /**
     * Zet event listeners op
     */
    private setupEventListeners(): void {
        this._button?.addEventListener("click", this.handleAddToWishlist.bind(this));

        // Hover effect
        this._button?.addEventListener("mouseover", () => {
            if (this._button) {
                this._button.style.opacity = "1";
            }
        });

        this._button?.addEventListener("mouseout", () => {
            if (this._button && !this._isInWishlist) {
                this._button.style.opacity = "0.7";
            }
        });
    }

    /**
     * Handelt het klikken op de knop af
     */
    private async handleAddToWishlist(e: Event): Promise<void> {
        e.preventDefault();

        try {
            // Controleer of het game ID geldig is
            if (!this._gameId) {
                this.showNotification("Geen geldig game ID gevonden", "error");
                return;
            }

            const response: Response = await fetch(`${VITE_API_URL}wishlist/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    game_id: this._gameId,
                }),
                credentials: "include",
            });

            const data: AddToWishlistResult = await response.json() as AddToWishlistResult;

            if (!response.ok) {
                if (response.status === 401) {
                    this.showNotification("Je moet ingelogd zijn om games toe te voegen aan favorieten", "error");
                    return;
                }
                this.showNotification(data.message || `Fout: ${response.statusText}`, "error");
                return;
            }

            if (data.success) {
                this._isInWishlist = true;
                this.updateButtonStyle();
                this.showNotification("✅ Toegevoegd aan favorieten", "success");
                document.dispatchEvent(new CustomEvent("wishlist-updated"));
            }
            else {
                this.showNotification(data.message || "Er is een fout opgetreden", "error");
            }
        }
        catch (error) {
            console.error("Fout bij toevoegen aan favorieten:", error);
            this.showNotification("Er is een fout opgetreden bij het toevoegen aan favorieten", "error");
        }
    }

    /**
     * Toon een notificatie
     */
    private showNotification(message: string, type: "success" | "error"): void {
        // Verwijder bestaande notificaties eerst
        const existingNotifications: NodeListOf<Element> = document.querySelectorAll(".wishlist-notification");
        existingNotifications.forEach(notification => notification.remove());

        const notification: HTMLDivElement = document.createElement("div");
        notification.textContent = message;
        notification.className = "wishlist-notification";
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
            notification.style.backgroundColor = "#6B46C1";
            notification.style.color = "white";
        }
        else {
            notification.style.backgroundColor = "#E53E3E";
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
customElements.define("add-to-wishlist", AddToWishlistComponent);
