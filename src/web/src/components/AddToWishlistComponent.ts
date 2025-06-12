// Declare VITE_API_URL as it comes from environment variables
declare const VITE_API_URL: string;

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

    public constructor() {
        super();
    }

    public connectedCallback(): void {
        this.render();
        this.setupEventListeners();
        void this.checkWishlistStatus();
    }

    public static get observedAttributes(): string[] {
        return ["game-id"];
    }

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
        this._button.style.fontSize = "28px";
        this._button.style.cursor = "pointer";
        this._button.style.padding = "8px";
        this._button.style.transition = "all 0.2s ease";
        this._button.style.color = "#7f3df4";
        this._button.style.opacity = "0.9";

        this.appendChild(this._button);
        this.updateButtonStyle();
    }

    private updateButtonStyle(): void {
        if (!this._button) return;

        if (this._isInWishlist) {
            this._button.style.color = "#7f3df4";
            this._button.style.opacity = "1";
        }
        else {
            this._button.style.color = "#7f3df4";
            this._button.style.opacity = "0.9";
        }

        // Add hover effect
        this._button.addEventListener("mouseover", () => {
            if (this._button) {
                this._button.style.transform = "scale(1.1)";
                this._button.style.opacity = "1";
                this._button.style.color = "#9b5dfc";
            }
        });

        this._button.addEventListener("mouseout", () => {
            if (this._button) {
                this._button.style.transform = "scale(1)";
                if (!this._isInWishlist) {
                    this._button.style.opacity = "0.9";
                }
                this._button.style.color = "#7f3df4";
            }
        });
    }

    private setupEventListeners(): void {
        this._button?.addEventListener("click", this.handleAddToWishlist.bind(this));
    }

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

        // Maak een notificatie element
        const notification: HTMLDivElement = document.createElement("div");
        notification.textContent = message;
        notification.className = "wishlist-notification";
        notification.style.position = "fixed";
        notification.style.top = "80px";
        notification.style.right = "20px";
        notification.style.padding = "16px 24px";
        notification.style.borderRadius = "12px";
        notification.style.color = "white";
        notification.style.fontSize = "14px";
        notification.style.fontWeight = "500";
        notification.style.zIndex = "9999";
        notification.style.maxWidth = "350px";
        notification.style.minWidth = "280px";
        notification.style.overflowWrap = "break-word";
        notification.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
        notification.style.backdropFilter = "blur(10px)";
        notification.style.border = "1px solid rgba(255, 255, 255, 0.1)";
        notification.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        notification.style.transform = "translateX(100%) scale(0.8)";
        notification.style.opacity = "0";

        if (type === "success") {
            notification.style.background = "linear-gradient(135deg, #10B981 0%, #059669 100%)";
            notification.style.borderColor = "rgba(16, 185, 129, 0.3)";
        }
        else {
            notification.style.background = "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)";
            notification.style.borderColor = "rgba(239, 68, 68, 0.3)";
        }

        // Voeg toe aan de body
        document.body.appendChild(notification);

        // Animatie voor het verschijnen
        requestAnimationFrame(() => {
            notification.style.transform = "translateX(0) scale(1)";
            notification.style.opacity = "1";
        });

        // Voeg hover effect toe
        notification.addEventListener("mouseenter", () => {
            notification.style.transform = "translateX(0) scale(1.05)";
            notification.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.3)";
        });

        notification.addEventListener("mouseleave", () => {
            notification.style.transform = "translateX(0) scale(1)";
            notification.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.2)";
        });

        // Verwijder na 4 seconden met animatie
        setTimeout(() => {
            notification.style.transform = "translateX(100%) scale(0.8)";
            notification.style.opacity = "0";

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 4000);
    }
}

customElements.define("add-to-wishlist", AddToWishlistComponent);
