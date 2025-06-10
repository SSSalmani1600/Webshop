import { CartItem } from "../interfaces/CartItem";
import { CartItemComponent } from "../components/CartItemComponent";
import { NavbarComponent } from "../components/NavbarComponent";

// Dit is de hoofdpagina voor de winkelwagen die alle producten laat zien
export class CartPageComponent extends HTMLElement {
    // Deze variabelen houden de status van de winkelwagen bij
    private currentDiscount: number = 0; // Hoeveel procent korting er nu is
    private currentDiscountCode: string = ""; // Welke kortingscode er wordt gebruikt
    private cartItems: CartItem[] = []; // Lijst met alle producten
    private isUpdating: boolean = false; // Voorkomt dat we dubbel updaten

    public constructor() {
        super();
        // Maak een afgeschermde omgeving voor deze component
        const shadow: ShadowRoot = this.attachShadow({ mode: "open" });

        // Voeg de styling toe voor de pagina
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

            .cart-container {
                min-width: 300px;
                padding: 1.5rem;
            }

            .cart-container h2 {
                margin-bottom: 1rem;
            }

            .cart-content {
                display: flex;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: flex-start;
            }

            #cart-list {
                flex: 3;
                min-width: 300px;
            }

            .cart-item {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.8rem;
                background-color: #222121;
                border-radius: 6px;
                margin-bottom: 1rem;
                font-size: 0.9rem;
            }

            .cart-item img {
                width: 180px;
                height: 100px;
                object-fit: cover;
                border-radius: 4px;
            }

            .item-details {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                flex: 1;
                padding-top: 0.2rem;
            }

            .item-details h4 {
                margin: 0 0 0.4rem 0;
                font-size: 1rem;
            }

            .item-details p {
                margin: 0;
                font-size: 0.85rem;
                color: #ccc;
            }

            .item-price {
                min-width: 80px;
                text-align: right;
                font-weight: bold;
                padding-top: 0.2rem;
                font-size: 1rem;
            }

            .cart-summary {
                flex: 1;
                min-width: 250px;
                padding: 1rem;
                border-radius: 8px;
                background-color: #222121;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .summary-inner {
                width: 100%;
                max-width: 300px;
                display: flex;
                flex-direction: column;
                align-items: stretch;
                gap: 1rem;
            }

            .cart-summary-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                width: 100%;
            }

            .cart-summary h3 {
                margin: 0;
                font-size: 1rem;
            }

            #total-price {
                margin: 0;
                font-size: 1rem;
                font-weight: bold;
                text-align: right;
            }

            .original-price {
                text-decoration: line-through;
                color: #666;
                font-size: 0.9rem;
                margin-right: 0.5rem;
            }

            .price-container {
                display: flex;
                align-items: center;
                justify-content: flex-end;
            }

            .discount-info {
                color: #703bf7;
                font-size: 0.9rem;
                margin-top: 0.5rem;
                text-align: right;
            }

            .discount-info.active {
                display: block;
            }

            .discount-info:not(.active) {
                display: none;
            }

            .checkout-button {
                align-self: center;
                height: 40px;
                width: 100%;
                padding: 0.4rem 0.8rem;
                background-color: #703bf7;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                font-size: 0.8rem;
            }

            .cart-header {
                height: 150px;
                background: linear-gradient(90deg, rgba(38, 38, 38, 1) 0%, rgba(38, 38, 38, 0) 53%);
                display: block;
                margin: 0;
                padding: 2.5rem;
                box-sizing: border-box;
            }

            .cart-header h2 {
                font-size: 1.5rem;
                font-weight: bold;
                margin: 0;
            }

            .cart-header p {
                margin-top: 0.8rem;
                color: #ccc;
            }

            .empty-message {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                margin-top: 4rem;
                gap: 1.5rem;
            }

            .empty-cart-image {
                max-width: 100px;
                height: auto;
                opacity: 0.8;
            }

            .empty-cart-text {
                font-size: 1rem;
                color: #ccc;
                max-width: 300px;
                margin: 0;
            }

            @media (max-width: 768px) {
                .cart-content {
                    flex-direction: column;
                }

                .cart-item {
                    flex-direction: column;
                    align-items: flex-start;
                }

                .cart-item img {
                    width: 100%;
                    height: auto;
                }

                .item-price {
                    text-align: left;
                    padding-top: 0.5rem;
                }

                .checkout-button {
                    width: 100%;
                }

                .summary-inner {
                    width: 100%;
                }
            }
        `;

        // Maak de basis HTML structuur voor de pagina
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

    // Deze functie wordt aangeroepen als de pagina wordt geladen
    public connectedCallback(): void {
        // Haal de winkelwagen inhoud op van de server
        void this.fetchCart();

        // Als op 'verder winkelen' wordt geklikt, ga naar de productpagina
        const continueShoppingButton: HTMLButtonElement = this.shadowRoot?.querySelector(".continue-shopping-button") as HTMLButtonElement;
        continueShoppingButton.addEventListener("click", () => {
            window.location.href = "product.html";
        });

        // Als op 'checkout' wordt geklikt, ga naar de afrekenpagina
        const checkoutButton: HTMLButtonElement = this.shadowRoot?.querySelector(".checkout-button") as HTMLButtonElement;
        checkoutButton.addEventListener("click", () => {
            window.location.href = "checkout.html";
        });

        // Luister naar kortingscodes die worden ingevoerd
        const discountComponent: Element = this.shadowRoot?.querySelector("discount-code-component") as Element;
        discountComponent.addEventListener("discount-applied", async (event: Event) => {
            const customEvent: CustomEvent<{ discountPercentage: number; code: string }> = event as CustomEvent<{ discountPercentage: number; code: string }>;
            this.currentDiscount = customEvent.detail.discountPercentage;
            this.currentDiscountCode = customEvent.detail.code;
            await this.fetchCart();
        });
    }

    // Deze functie haalt de winkelwagen inhoud op van de server
    private async fetchCart(): Promise<void> {
        // Voorkom dat we dubbel ophalen
        if (this.isUpdating) return;
        this.isUpdating = true;

        try {
            // Bepaal welke server moeten gebruiken (lokaal of online)
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            // Voeg de kortingscode toe aan het verzoek als die er is
            const url: URL = new URL(`${API_BASE}/cart`);
            if (this.currentDiscountCode) {
                url.searchParams.append("discountCode", this.currentDiscountCode);
            }

            // Vraag de winkelwagen op van de server
            const res: Response = await fetch(url.toString(), {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            });

            // Als er iets mis is met de aanmelding
            if (!res.ok) {
                if (res.status === 401) {
                    // Laat zien dat de gebruiker moet inloggen
                    const cartList: HTMLElement = this.shadowRoot?.querySelector("#cart-list") as HTMLElement;
                    const summary: HTMLElement = this.shadowRoot?.querySelector(".cart-summary") as HTMLElement;
                    const continueShopping: HTMLElement = this.shadowRoot?.querySelector(".continue-shopping-button") as HTMLElement;

                    summary.style.display = "none";
                    continueShopping.style.display = "none";

                    cartList.innerHTML = `
                        <div class="empty-message">
                            <img src="/assets/images/cart_empty.png" alt="Login required" class="empty-cart-image">
                            <p class="empty-cart-text">Log eerst in om je winkelwagen te bekijken</p>
                            <a href="login.html" class="continue-shopping-button primary">Inloggen</a>
                        </div>
                    `;
                    return;
                }
                throw new Error(`Failed to fetch cart: ${res.statusText}`);
            }

            // Dit is het formaat van het antwoord dat we verwachten
            interface CartResponse {
                cart: CartItem[];
                total: number;
                subtotal?: number;
                discountPercentage?: number;
            }

            // Lees het antwoord van de server
            const data: CartResponse = await res.json() as CartResponse;
            this.cartItems = data.cart;
            // Update wat we op het scherm laten zien
            this.updateCartDisplay({
                total: data.total,
                discountPercentage: data.discountPercentage ?? this.currentDiscount,
                subtotal: data.subtotal ?? data.total,
            });
        }
        catch (e) {
            // Als er iets mis gaat, laat een foutmelding zien
            console.error("Fout bij ophalen winkelwagen:", e);
            const cartList: HTMLElement = this.shadowRoot?.querySelector("#cart-list") as HTMLElement;
            cartList.innerHTML = `
                <div class="empty-message">
                    <p class="empty-cart-text">Er is een fout opgetreden bij het ophalen van je winkelwagen. Probeer het later opnieuw.</p>
                </div>
            `;
        }
        finally {
            // We zijn klaar met updaten
            this.isUpdating = false;
        }
    }

    // Deze functie verwijdert een product uit de winkelwagen
    private async deleteCartItem(itemId: number): Promise<void> {
        try {
            // Bepaal welke server we moeten gebruiken
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            // Stuur een verzoek om het product te verwijderen
            const deleteResponse: Response = await fetch(`${API_BASE}/cart/item/${itemId}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            });

            // Als er iets mis is met de aanmelding
            if (!deleteResponse.ok) {
                if (deleteResponse.status === 401) {
                    // Laat zien dat de gebruiker moet inloggen
                    const cartList: HTMLElement = this.shadowRoot?.querySelector("#cart-list") as HTMLElement;
                    const summary: HTMLElement = this.shadowRoot?.querySelector(".cart-summary") as HTMLElement;
                    const continueShopping: HTMLElement = this.shadowRoot?.querySelector(".continue-shopping-button") as HTMLElement;

                    summary.style.display = "none";
                    continueShopping.style.display = "none";

                    cartList.innerHTML = `
                        <div class="empty-message">
                            <img src="/assets/images/cart_empty.png" alt="Login required" class="empty-cart-image">
                            <p class="empty-cart-text">Log eerst in om je winkelwagen te bekijken</p>
                            <a href="login.html" class="continue-shopping-button primary">Inloggen</a>
                        </div>
                    `;
                    return;
                }
                throw new Error(`Failed to delete item: ${deleteResponse.statusText}`);
            }

            // Verwijder het product uit onze lijst en update het scherm
            this.cartItems = this.cartItems.filter(item => item.id !== itemId);
            await this.fetchCart();
        }
        catch (error) {
            // Als er iets mis gaat, probeer de winkelwagen opnieuw op te halen
            console.error("Error deleting item:", error);
            void this.fetchCart();
        }
    }

    // Deze functie update wat we op het scherm laten zien
    private updateCartDisplay(data?: { total: number; discountPercentage: number; subtotal: number }): void {
        const shadow: ShadowRoot = this.shadowRoot!;
        const cartList: HTMLElement = shadow.querySelector("#cart-list") as HTMLElement;
        const totalDisplay: HTMLElement = shadow.querySelector("#total-price") as HTMLElement;
        const summary: HTMLElement = shadow.querySelector(".cart-summary") as HTMLElement;
        const header: HTMLElement = shadow.querySelector(".cart-header p") as HTMLElement;
        const continueShopping: HTMLElement = shadow.querySelector(".continue-shopping-button") as HTMLElement;

        cartList.innerHTML = "";

        // Als de winkelwagen leeg is
        if (this.cartItems.length === 0) {
            // Laat een bericht zien dat de wagen leeg is
            header.textContent = "Er zijn geen producten in je winkelmandje.";
            summary.style.display = "none";
            continueShopping.style.display = "none";

            const emptyMessage: HTMLDivElement = document.createElement("div");
            emptyMessage.className = "empty-message";

            // Voeg een plaatje toe van een lege winkelwagen
            const emptyImg: HTMLImageElement = document.createElement("img");
            emptyImg.src = "/assets/images/cart_empty.png";
            emptyImg.className = "empty-cart-image";
            emptyImg.alt = "Lege winkelwagen";

            // Voeg een bericht en knop toe
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

        // Als er wel producten in de winkelwagen zitten
        summary.style.display = "flex";
        continueShopping.style.display = "block";
        header.textContent = "Rond je bestelling af - producten aan je winkelwagen toevoegen betekent geen reservering.";

        // Voeg elk product toe aan het scherm
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

        // Update de totaalbedragen
        if (data) {
            const originalTotal: HTMLElement = shadow.querySelector("#original-total") as HTMLElement;
            if (data.discountPercentage > 0) {
                // Als er korting is, laat beide prijzen zien
                originalTotal.textContent = `€${data.subtotal.toFixed(2)}`;
                totalDisplay.textContent = `€${data.total.toFixed(2)}`;
            }
            else {
                // Anders alleen de normale prijs
                originalTotal.textContent = "";
                totalDisplay.textContent = `€${data.total.toFixed(2)}`;
            }
        }
    }
}

// Registreer de componenten zodat we ze kunnen gebruiken in HTML
customElements.define("webshop-page-cart", CartPageComponent);
if (!customElements.get("navbar-component")) {
    customElements.define("navbar-component", NavbarComponent);
}
