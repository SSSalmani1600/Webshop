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
            padding: 1.5rem;
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



        </div>
        
      </div>
    `;

        shadow.append(style, container);
    }

    public connectedCallback(): void {
        void this.fetchCart();
    }

    private async fetchCart(): Promise<void> {
        try {
            const res: Response = await fetch("http://localhost:3001/cart", {
                credentials: "include",
            });

            const data: { cart: CartItem[] } = await res.json() as { cart: CartItem[] };
            const cart: CartItem[] = data.cart;

            const container: HTMLElement | null = this.shadowRoot ? this.shadowRoot.querySelector("#cart-list") : null;
            const totalDisplay: HTMLElement | null = this.shadowRoot?.querySelector("#total-price") ?? null;

            if (!container || !totalDisplay) {
                return;
            }

            let total: number = 0;
            container.innerHTML = "";
            cart.forEach((item: CartItem) => {
                const element: CartItemComponent = new CartItemComponent(item);
                container.appendChild(element);
                const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                total += price * item.quantity;
            });

            totalDisplay.textContent = `€${total.toFixed(2)}`;
        }
        catch (e) {
            console.error("Fout bij ophalen winkelwagen:", e);
        }
    }
}

customElements.define("webshop-page-cart", CartPageComponent);
