import { CartItem } from "../interfaces/CartItem";
import { CartItemComponent } from "../components/CartItemComponent";
import { NavbarComponent } from "../components/NavbarComponent";

// Hoofdcomponent voor de winkelwagenpagina die producten toont, kortingen toepast en totalen berekent
export class CartPageComponent extends HTMLElement {
    // Status variabelen voor de winkelwagen
    private currentDiscount: number = 0; // Huidig toegepaste kortingspercentage
    private currentDiscountCode: string = ""; // Actieve kortingscode
    private cartItems: CartItem[] = []; // Lijst met producten in winkelwagen
    private isUpdating: boolean = false; // Voorkomt dubbele updates

    public constructor() {
        super();
        // Maak een shadow DOM aan voor isolatie van styles
        const shadow: ShadowRoot = this.attachShadow({ mode: "open" });

        // Voeg styles toe voor de winkelwagen layout
        const style: HTMLStyleElement = document.createElement("style");
        style.textContent = `
            // Basis styling voor de hele component
            :host {
                display: block;
                background-color: #141414;
                color: white;
                font-family: sans-serif;
                min-height: 100vh;
            }

            // Styling voor de 'verder winkelen' knop
            .continue-shopping-button {
                margin-top: 2rem;
                padding: 0.8rem 1.5rem;
                background-color: #222121;
                color: white;
                border: none;
                border-radius: 10px;
                cursor: pointer;
            }

            // Primaire variant van de knop (paars)
            .continue-shopping-button.primary {
                margin: 2rem auto 0;
                background-color: #703bf7;
                display: block;
            }

            // Container voor de hele winkelwagen
            .cart-container {
                min-width: 300px;
                padding: 1.5rem;
            }

            // Flex container voor producten en totaal
            .cart-content {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 1rem;
            }

            // Lijst met winkelwagen items
            #cart-list {
                flex: 3;
                min-width: 300px;
            }

            // Styling voor het totaal overzicht
            .cart-summary {
                flex: 1;
                min-width: 250px;
                padding: 1rem;
                border-radius: 8px;
                background-color: #222121;
            }

            // Container voor de checkout knop
            .summary-inner {
                width: 100%;
                max-width: 300px;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }

            // Header van de winkelwagen met gradient
            .cart-header {
                height: 150px;
                background: linear-gradient(90deg, rgba(38, 38, 38, 1) 0%, rgba(38, 38, 38, 0) 53%);
                padding: 2.5rem;
            }

            // Styling voor lege winkelwagen melding
            .empty-message {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                margin-top: 4rem;
            }
        `;

        // Maak de basis HTML structuur aan
        const container: HTMLDivElement = document.createElement("div");
        container.innerHTML = `
            <navbar-component></navbar-component>
            <div class="cart-header">
                <h2>Winkelwagen</h2>
                <p>Rond je bestelling af - producten aan je winkelwagen toevoegen betekent geen reservering</p>
            </div>

            <div class="cart-container">
                <div class="cart-content">
                    <div id="cart-list"></div>

                    <div class="cart-summary">
                        <div class="summary-inner">
                            <div class="cart-summary-header">
                                <h3>Totaal</h3>
                                <div class="price-container">
                                    <span id="original-total" class="original-price"></span>
                                    <p id="total-price">€0,00</p>
                                </div>
                            </div>
                            <discount-code-component></discount-code-component>
                            <button class="checkout-button">Ga door naar checkout</button>
                        </div>
                    </div>
                </div>

                <button class="continue-shopping-button">Verder winkelen</button>
            </div>
        `;

        shadow.append(style, container);
    }

    public connectedCallback(): void {
        // Haal winkelwagen data op zodra component wordt toegevoegd aan de DOM
        void this.fetchCart();

        // Event listener voor 'verder winkelen' knop
        const continueShoppingButton: HTMLButtonElement | null = this.shadowRoot?.querySelector(".continue-shopping-button") ?? null;
        if (continueShoppingButton) {
            continueShoppingButton.addEventListener("click", () => {
                window.location.href = "product.html";
            });
        }

        // Event listener voor checkout knop
        const checkoutButton: HTMLButtonElement | null = this.shadowRoot?.querySelector(".checkout-button") ?? null;
        if (checkoutButton) {
            checkoutButton.addEventListener("click", () => {
                window.location.href = "checkout.html";
            });
        }

        // Event listener voor kortingscode component
        const discountComponent: Element | null = this.shadowRoot?.querySelector("discount-code-component") ?? null;
        if (discountComponent) {
            discountComponent.addEventListener("discount-applied", async (event: Event) => {
                // Update korting wanneer een code wordt toegepast
                const customEvent: CustomEvent<{ discountPercentage: number; code: string }> = event as CustomEvent<{ discountPercentage: number; code: string }>;
                this.currentDiscount = customEvent.detail.discountPercentage;
                this.currentDiscountCode = customEvent.detail.code;
                await this.fetchCart();
            });
        }
    }

    private async fetchCart(): Promise<void> {
        // Voorkom dubbele updates
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            // Bepaal de juiste API URL op basis van environment
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            // Voeg kortingscode toe aan URL als die er is
            const url: URL = new URL(`${API_BASE}/cart`);
            if (this.currentDiscountCode) {
                url.searchParams.append("discountCode", this.currentDiscountCode);
            }

            // Haal winkelwagen data op van de server
            const res: Response = await fetch(url.toString(), {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                if (res.status === 401) {
                    // Toon login melding als gebruiker niet is ingelogd
                    const cartList: HTMLElement | null = this.shadowRoot?.querySelector("#cart-list") as HTMLElement | null;
                    const summary: HTMLElement = this.shadowRoot?.querySelector(".cart-summary") as HTMLElement;
                    const continueShopping: HTMLElement = this.shadowRoot?.querySelector(".continue-shopping-button") as HTMLElement;

                    if (cartList) {
                        summary.style.display = "none";
                        continueShopping.style.display = "none";

                        cartList.innerHTML = `
                            <div class="empty-message">
                                <img src="/assets/images/cart_empty.png" alt="Login required" class="empty-cart-image">
                                <p class="empty-cart-text">Log eerst in om je winkelwagen te bekijken</p>
                                <a href="login.html" class="continue-shopping-button primary">Inloggen</a>
                            </div>
                        `;
                    }
                    return;
                }
                throw new Error(`Failed to fetch cart: ${res.statusText}`);
            }

            // Parse de response data
            interface CartResponse {
                cart: CartItem[];
                total: number;
                subtotal?: number;
                discountPercentage?: number;
            }

            const data: CartResponse = await res.json() as CartResponse;
            this.cartItems = data.cart;

            // Update de weergave met nieuwe data
            this.updateCartDisplay({
                total: data.total,
                discountPercentage: data.discountPercentage ?? this.currentDiscount,
                subtotal: data.subtotal ?? data.total,
            });
        }
        catch (e) {
            // Toon foutmelding als er iets mis gaat
            console.error("Fout bij ophalen winkelwagen:", e);
            const cartList: HTMLElement | null = this.shadowRoot?.querySelector("#cart-list") as HTMLElement | null;
            if (cartList) {
                cartList.innerHTML = `
                    <div class="empty-message">
                        <p class="empty-cart-text">Er is een fout opgetreden bij het ophalen van je winkelwagen. Probeer het later opnieuw.</p>
                    </div>
                `;
            }
        }
        finally {
            this.isUpdating = false;
        }
    }

    private async deleteCartItem(itemId: number): Promise<void> {
        try {
            // Bepaal API URL voor verwijderen
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            // Stuur delete request naar de server
            const deleteResponse: Response = await fetch(`${API_BASE}/cart/item/${itemId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (!deleteResponse.ok) {
                if (deleteResponse.status === 401) {
                    // Toon login melding als sessie verlopen is
                    const cartList: HTMLElement | null = this.shadowRoot?.querySelector("#cart-list") as HTMLElement | null;
                    const summary: HTMLElement = this.shadowRoot?.querySelector(".cart-summary") as HTMLElement;
                    const continueShopping: HTMLElement = this.shadowRoot?.querySelector(".continue-shopping-button") as HTMLElement;

                    if (cartList) {
                        summary.style.display = "none";
                        continueShopping.style.display = "none";

                        cartList.innerHTML = `
                            <div class="empty-message">
                                <img src="/assets/images/cart_empty.png" alt="Login required" class="empty-cart-image">
                                <p class="empty-cart-text">Log eerst in om je winkelwagen te bekijken</p>
                                <a href="login.html" class="continue-shopping-button primary">Inloggen</a>
                            </div>
                        `;
                    }
                    return;
                }
                throw new Error(`Failed to delete item: ${deleteResponse.statusText}`);
            }

            // Update lokale lijst en UI
            this.cartItems = this.cartItems.filter(item => item.id !== itemId);
            await this.fetchCart();
        }
        catch (error) {
            console.error("Error deleting item:", error);
            void this.fetchCart();
        }
    }

    private updateCartDisplay(data?: { total: number; discountPercentage: number; subtotal: number }): void {
        const shadow: ShadowRoot = this.shadowRoot!;
        const cartList: HTMLElement = shadow.querySelector("#cart-list")!;
        const totalDisplay: HTMLElement = shadow.querySelector("#total-price")!;
        const summary: HTMLElement = shadow.querySelector(".cart-summary") as HTMLElement;
        const header: HTMLElement = shadow.querySelector(".cart-header p")!;
        const continueShopping: HTMLElement = shadow.querySelector(".continue-shopping-button") as HTMLElement;

        cartList.innerHTML = "";

        // Toon lege winkelwagen melding als er geen items zijn
        if (this.cartItems.length === 0) {
            header.textContent = "Er zijn geen producten in je winkelmandje.";
            summary.style.display = "none";
            continueShopping.style.display = "none";

            const emptyMessage: HTMLDivElement = document.createElement("div");
            emptyMessage.className = "empty-message";

            // Voeg lege winkelwagen afbeelding toe
            const emptyImg: HTMLImageElement = document.createElement("img");
            emptyImg.src = "/assets/images/cart_empty.png";
            emptyImg.className = "empty-cart-image";
            emptyImg.alt = "Lege winkelwagen";

            // Voeg tekst en knop toe
            const emptyText: HTMLParagraphElement = document.createElement("p");
            emptyText.textContent = "Je winkelmandje is leeg. Voeg producten toe om te beginnen met shoppen!";
            emptyText.className = "empty-cart-text";

            const startShoppingBtn: HTMLButtonElement = document.createElement("button");
            startShoppingBtn.className = "continue-shopping-button primary";
            startShoppingBtn.textContent = "Begin met winkelen";
            startShoppingBtn.addEventListener("click", () => {
                window.location.href = "product.html";
            });

            emptyMessage.appendChild(emptyImg);
            emptyMessage.appendChild(emptyText);
            emptyMessage.appendChild(startShoppingBtn);
            cartList.appendChild(emptyMessage);
            return;
        }

        // Toon winkelwagen items en totalen
        summary.style.display = "flex";
        continueShopping.style.display = "block";
        header.textContent = "Rond je bestelling af - producten aan je winkelwagen toevoegen betekent geen reservering.";

        // Maak cart items aan en voeg ze toe
        this.cartItems.forEach((item: CartItem) => {
            const element: CartItemComponent = new CartItemComponent(item);
            element.setDiscount(data?.discountPercentage ?? this.currentDiscount);

            element.addEventListener("item-delete", async (event: Event) => {
                const customEvent: CustomEvent<{ id: number }> = event as CustomEvent<{ id: number }>;
                const itemId: number = customEvent.detail.id;
                await this.deleteCartItem(itemId);
            });

            cartList.appendChild(element);
        });

        // Update totaalbedragen
        if (data) {
            const originalTotal: HTMLElement = shadow.querySelector("#original-total")!;
            if (data.discountPercentage > 0) {
                originalTotal.textContent = `€${data.subtotal.toFixed(2)}`;
                totalDisplay.textContent = `€${data.total.toFixed(2)}`;
            }
            else {
                originalTotal.textContent = "";
                totalDisplay.textContent = `€${data.total.toFixed(2)}`;
            }
        }
    }
}

customElements.define("webshop-page-cart", CartPageComponent);
if (!customElements.get("navbar-component")) {
    customElements.define("navbar-component", NavbarComponent);
}
