// Interface die beschrijft hoe een item in de winkelwagen eruitziet
interface CartItem {
    id: number;
    game_id: number;
    quantity: number; // Hoeveel stuks
    price: number; // Prijs per stuk
    name: string; // Naam van het product
}

// Astructuur van de API: een lijst van cart items
interface CartResponse {
    cart: CartItem[];
}

// Deze class laat de winkelwagen zien op de afrekenpagina
export class CheckoutproductComponent extends HTMLElement {
    public constructor() {
        super();
        this.attachShadow({ mode: "open" }); // Maakt een shadow DOM aan
    }

    // Deze functie haalt de winkelwagen op en laat die zien op de pagina
    public async render(): Promise<void> {
        const cartItems: CartItem[] = await this.fetchCartItems(); // Haal producten op uit de winkelwagen
        const totaal: number = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0); // Bereken totaalprijs

        if (!this.shadowRoot) {
            return;
        }

        // Zet de HTML in de DOM
        this.shadowRoot.innerHTML = `
            <style>
                /* Styling voor elk item in de winkelwagen */
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
            const totaalItem: number = prijs * item.quantity; // Prijs voor dit specifieke item (prijs * aantal)
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
                Totaal: €${totaal.toFixed(2)} <!-- Laat totaalbedrag zien -->
            </div>
        `;
    }

    // Deze functie haalt de winkelwagen op van de API
    private async fetchCartItems(): Promise<CartItem[]> {
        // Gebruik lokale API als je op localhost zit, anders de online versie
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

        const res: Response = await fetch(`${API_BASE}/cart`, {
            credentials: "include", // Zorgt dat cookies worden meegestuurd
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`); // Geef foutmelding als ophalen mislukt
        }

        const data: CartResponse = await res.json() as CartResponse; // Zet JSON om naar CartResponse
        return data.cart; // Geef de winkelwagen terug
    }
}

// Registreer de custom HTML tag <checkout-product>
customElements.define("checkout-product", CheckoutproductComponent);
