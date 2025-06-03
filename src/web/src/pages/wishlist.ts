import { WishlistItem } from "../../../api/src/types/WishlistItem";
import { WishlistItemComponent } from "../components/WishlistItemComponent";
import { NavbarComponent } from "../components/NavbarComponent";
import { WishlistService } from "../services/WishlistService";

export class WishlistPageComponent extends HTMLElement {
    private wishlistItems: WishlistItem[] = [];
    private isUpdating: boolean = false;
    private readonly wishlistService: WishlistService = new WishlistService();

    public constructor() {
        super();
        const shadow: ShadowRoot = this.attachShadow({ mode: "open" });

        const style: HTMLStyleElement = document.createElement("style");
        style.textContent = `
            :host {
                display: block;
                background-color: #141414;
                color: white;
                font-family: sans-serif;
                padding: 0;
                margin: 0;
                min-height: 100vh;
                box-sizing: border-box;
                width: 100%;
                position: absolute;
                top: 0;
                left: 0;
            }

            .wishlist-header {
                height: 150px;
                background: linear-gradient(90deg, rgba(38, 38, 38, 1) 0%, rgba(38, 38, 38, 0) 53%);
                display: block;
                margin: 0;
                padding: 2.5rem;
                box-sizing: border-box;
            }

            .wishlist-header h2 {
                font-size: 1.5rem;
                font-weight: bold;
                margin: 0;
            }

            .wishlist-header p {
                margin-top: 0.8rem;
                color: #ccc;
            }

            .wishlist-container {
                padding: 2rem;
                max-width: 1400px;
                margin: 0 auto;
            }

            .wishlist-content {
                width: 100%;
            }

            #wishlist-list {
                width: 100%;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 1rem;
            }

            .empty-message {
                grid-column: 1 / -1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                margin-top: 4rem;
                gap: 1rem;
            }

            .empty-wishlist-text {
                font-size: 1.1rem;
                color: #ccc;
                max-width: 300px;
                margin: 0;
            }

            .continue-shopping-button {
                margin-top: 2rem;
                padding: 0.8rem 1.5rem;
                background-color: #222121;
                color: white;
                border: none;
                border-radius: 10px;
                font-size: 1rem;
                cursor: pointer;
                text-align: center;
                display: inline-block;
            }

            .continue-shopping-button.primary {
                margin: 2rem auto 0;
                background-color: #703bf7;
                display: block;
            }

            @media (max-width: 768px) {
                .wishlist-container {
                    padding: 1rem;
                }
            }
        `;

        const container: HTMLDivElement = document.createElement("div");
        container.innerHTML = `
            <navbar-component></navbar-component>
            <div class="wishlist-header">
                <h2>Mijn Favorieten</h2>
                <p>Bekijk je favoriete games</p>
            </div>

            <div class="wishlist-container">
                <div class="wishlist-content">
                    <div id="wishlist-list"></div>
                </div>
            </div>
        `;

        shadow.append(style, container);
    }

    public connectedCallback(): void {
        void this.fetchWishlist();
    }

    private async deleteWishlistItem(itemId: number): Promise<void> {
        try {
            await this.wishlistService.deleteWishlistItem(itemId);
            // Update na verwijdering
            this.wishlistItems = this.wishlistItems.filter(item => item.id !== itemId);
            this.updateWishlistDisplay();
        }
        catch (error) {
            console.error("Error deleting item:", error);
            void this.fetchWishlist();
        }
    }

    private async fetchWishlist(): Promise<void> {
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            this.wishlistItems = await this.wishlistService.getWishlist();
            this.updateWishlistDisplay();
        }
        catch (error: unknown) {
            console.error("Fout bij ophalen favorieten:", error instanceof Error ? error.message : "Onbekende fout");

            if (error instanceof Error && error.message === "UNAUTHORIZED") {
                this.showLoginMessage();
                return;
            }

            const wishlistList: HTMLElement | null = this.shadowRoot?.querySelector("#wishlist-list") as HTMLElement | null;
            if (wishlistList) {
                wishlistList.innerHTML = `
                    <div class="error-message">
                        Er is een fout opgetreden bij het ophalen van je favorieten. Probeer het later opnieuw.
                    </div>
                `;
            }
        }
        finally {
            this.isUpdating = false;
        }
    }

    private showLoginMessage(): void {
        const shadow: ShadowRoot = this.shadowRoot!;
        const wishlistList: HTMLElement = shadow.querySelector("#wishlist-list")!;
        const header: HTMLElement = shadow.querySelector(".wishlist-header p")!;

        header.textContent = "Log in om je favorieten te bekijken";

        const loginMessage: HTMLDivElement = document.createElement("div");
        loginMessage.className = "empty-message";

        const loginText: HTMLParagraphElement = document.createElement("p");
        loginText.textContent = "Je moet ingelogd zijn om je favoriete games te bekijken. Log in om je favorieten op te slaan!";
        loginText.className = "empty-wishlist-text";

        const loginButton: HTMLButtonElement = document.createElement("button");
        loginButton.className = "continue-shopping-button primary";
        loginButton.textContent = "Inloggen";
        loginButton.addEventListener("click", () => {
            window.location.href = "login.html";
        });

        loginMessage.appendChild(loginText);
        loginMessage.appendChild(loginButton);
        wishlistList.innerHTML = "";
        wishlistList.appendChild(loginMessage);
    }

    private updateWishlistDisplay(): void {
        const shadow: ShadowRoot = this.shadowRoot!;
        const wishlistList: HTMLElement = shadow.querySelector("#wishlist-list")!;
        const header: HTMLElement = shadow.querySelector(".wishlist-header p")!;

        wishlistList.innerHTML = "";

        if (this.wishlistItems.length === 0) {
            header.textContent = "Je hebt nog geen favorieten toegevoegd.";

            const emptyMessage: HTMLDivElement = document.createElement("div");
            emptyMessage.className = "empty-message";

            const emptyText: HTMLParagraphElement = document.createElement("p");
            emptyText.textContent = "Je hebt nog geen favorieten. Voeg games toe aan je favorieten om ze later te bekijken!";
            emptyText.className = "empty-wishlist-text";

            const startShoppingBtn: HTMLButtonElement = document.createElement("button");
            startShoppingBtn.className = "continue-shopping-button primary";
            startShoppingBtn.textContent = "Begin met winkelen";
            startShoppingBtn.addEventListener("click", () => {
                window.location.href = "product.html";
            });

            emptyMessage.appendChild(emptyText);
            emptyMessage.appendChild(startShoppingBtn);
            wishlistList.appendChild(emptyMessage);
            return;
        }

        header.textContent = "Bekijk je favoriete games";

        this.wishlistItems.forEach((item: WishlistItem) => {
            const element: WishlistItemComponent = new WishlistItemComponent(item);
            element.addEventListener("wishlistItemDeleted", async (event: Event) => {
                const customEvent: CustomEvent<{ itemId: number }> = event as CustomEvent<{ itemId: number }>;
                await this.deleteWishlistItem(customEvent.detail.itemId);
            });
            wishlistList.appendChild(element);
        });
    }
}

customElements.define("wishlist-page", WishlistPageComponent);
if (!customElements.get("navbar-component")) {
    customElements.define("navbar-component", NavbarComponent);
}
