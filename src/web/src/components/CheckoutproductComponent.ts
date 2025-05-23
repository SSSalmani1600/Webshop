// Dit zegt hoe één item in de winkelwagen eruitziet
interface CartItem {
    id: number;
    game_id: number;
    quantity: number;
    price: number;
    name: string;
}

interface CartResponse {
    cart: CartItem[];
}

// Deze class laat samenvatting van winkelwagen zien op de afrekenpagina
export class CheckoutproductComponent extends HTMLElement {
    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public async render(): Promise<void> {
        const cartItems: CartItem[] = await this.fetchCartItems();
        const totaal: number = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        if (!this.shadowRoot) {
            return;
        }

        this.shadowRoot.innerHTML = `
            <style>
                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid #eee;
                }
                .item-details {
                    flex: 1;
                }
                .item-price {
                    font-weight: bold;
                }
                .totaal {
                    text-align: right;
                    padding: 1rem;
                    font-weight: bold;
                }
            </style>
            <div class="cart-items">
                ${cartItems.map(item => {
            const prijs: number = item.price;
            const totaalItem: number = prijs * item.quantity;
            return `
                        <div class="cart-item">
                            <div class="item-details">
                                <div>${item.name}</div>
                                <div>Aantal: ${item.quantity}</div>
                            </div>
                            <div class="item-price">
                                €${totaalItem.toFixed(2)}
                            </div>
                        </div>
                    `;
        }).join("")}
            </div>
            <hr>
            <div class="totaal">
                Totaal: €${totaal.toFixed(2)}
            </div>
        `;
    }

    private async fetchCartItems(): Promise<CartItem[]> {
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

        const res: Response = await fetch(`${API_BASE}/cart`, {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: CartResponse = await res.json() as CartResponse;
        return data.cart;
    }
}

customElements.define("checkout-product", CheckoutproductComponent);
