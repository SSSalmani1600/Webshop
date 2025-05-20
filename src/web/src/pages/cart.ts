import { CartItem } from "../interfaces/CartItem";
import { CartItemComponent } from "../components/CartItemComponent";

export class CartPageComponent extends HTMLElement {
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
            max-width: 200px;
            height: auto;
            opacity: 0.8;
        }

        .empty-cart-text {
            font-size: 1rem;
            color: #ccc;
            max-width: 300px;
            margin: 0;
        }

        .empty-cart-image {
            max-width: 100px;
            height: auto;
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

        const container: HTMLDivElement = document.createElement("div");
        container.innerHTML = `
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
                                <p id="total-price">€0,00</p>
                            </div>
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
        void this.fetchCart();

        const continueShoppingButton: HTMLButtonElement | null = this.shadowRoot?.querySelector(".continue-shopping-button") ?? null;
        if (continueShoppingButton) {
            continueShoppingButton.addEventListener("click", () => {
                window.location.href = "product.html";
            });
        }
    }

    private async fetchCart(): Promise<void> {
        try {
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud";

            const res: Response = await fetch(`${API_BASE}/cart`, {
                credentials: "include",
            });

            const data: { cart: CartItem[]; total: number } = (await res.json()) as { cart: CartItem[]; total: number };
            const cart: CartItem[] = data.cart;
            const total: number = data.total;

            const shadow: ShadowRoot = this.shadowRoot!;
            const cartList: HTMLElement = shadow.querySelector("#cart-list")!;
            const totalDisplay: HTMLElement = shadow.querySelector("#total-price")!;
            const summary: HTMLElement = shadow.querySelector(".cart-summary") as HTMLElement;
            const header: HTMLElement = shadow.querySelector(".cart-header p")!;
            const continueShopping: HTMLElement = shadow.querySelector(".continue-shopping-button") as HTMLElement;

            cartList.innerHTML = "";

            // Winkelwagen is leeg
            if (cart.length === 0) {
                header.textContent = "Er zijn geen producten in je winkelmandje.";
                summary.style.display = "none";
                continueShopping.style.display = "none";

                const emptyMessage: HTMLDivElement = document.createElement("div");
                emptyMessage.className = "empty-message";

                const emptyImg: HTMLImageElement = document.createElement("img");
                emptyImg.src = "./assets/images/cart_empty.png";
                emptyImg.className = "empty-cart-image";

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

            // Winkelwagen bevat items
            summary.style.display = "flex";
            continueShopping.style.display = "block";
            header.textContent = "Rond je bestelling af - producten aan je winkelwagen toevoegen betekent geen reservering.";

            continueShopping.classList.remove("primary");
            continueShopping.classList.add("continue-shopping-button");
            continueShopping.style.margin = "2rem 0 0 0";
            continueShopping.style.backgroundColor = "#222121";
            continueShopping.style.color = "white";
            continueShopping.style.display = "inline-block";
            continueShopping.classList.remove("primary");

            cart.forEach((item: CartItem) => {
                const element: CartItemComponent = new CartItemComponent(item);

                element.addEventListener("item-delete", async (event: Event) => {
                    const customEvent: CustomEvent = event as CustomEvent<{ id: number }>;
                    const itemId: number = (customEvent.detail as { id: number }).id;

                    await this.deleteCartItem(itemId);
                    await this.fetchCart();
                });

                cartList.appendChild(element);
            });

            totalDisplay.textContent = `€${total.toFixed(2)}`;
        }
        catch (e) {
            console.error("Fout bij ophalen winkelwagen:", e);
        }
    }

    private async deleteCartItem(itemId: number): Promise<void> {
        try {
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud";

            await fetch(`${API_BASE}/cart/item/${itemId}`, {
                method: "DELETE",
                credentials: "include",
            });
        }
        catch (e) {
            console.error("Fout bij verwijderen item uit winkelwagen:", e);
        }
    }
}

customElements.define("webshop-page-cart", CartPageComponent);
