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
      }

      .cart-container {
        min-width: 300px;
        padding: 2rem;
      }

      .cart-container h2 {
        margin-bottom: 1.5rem;
      }

      .cart-content {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 2rem;
        align-items: flex-start;
      }

      #cart-list {
        flex: 3;
        min-width: 300px;
      }

      .cart-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background-color: #222121;
        border-radius: 10px;
        margin-bottom: 1rem;
      }

      .cart-item img {
        width: 120px;
        height: auto;
        border-radius: 8px;
      }

      .item-info {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .cart-summary {
        flex: 1;
        min-width: 250px;
        padding: 1rem;
        border-radius: 10px;
        height: fit-content;
        background-color: #222121;
      }

      .cart-summary h3 {
        margin-bottom: 1rem;
      }

      .checkout-button {
        width: 300px;
        height: 50px;
        padding: 0.5rem 1rem;
        margin-top: 1rem;
        background-color: #703bf7;
        border: none;
        border-radius: 5px;
        color: rgb(255, 255, 255);
        cursor: pointer;
        font-size: 1rem;
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
        }

        .checkout-button {
          width: 100%;
        }
      }

      .cart-header {
        height: 200px;
        background: linear-gradient(90deg, rgba(38, 38, 38, 1) 0%, rgba(38, 38, 38, 0) 53%);
        display: block;
        margin: 0;
        padding: 2rem;
        box-sizing: border-box;
      }

      .cart-header h2 {
        font-size: 2rem;
        font-weight: bold;
        margin: 0;
      }

      .cart-header p {
        margin-top: 1rem;
        color: #ccc;
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
            <h3>Totaal</h3>
            <p id="total-price">€0,00</p>
            <button class="checkout-button">Ga door naar checkout</button>
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
