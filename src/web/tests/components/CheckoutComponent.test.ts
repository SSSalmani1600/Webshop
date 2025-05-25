interface CartItem {
    id: number;
    game_id: number;
    quantity: number;
    price: string;
    title: string;
    thumbnail: string;
}

export class CartSummaryComponent {
    private container: HTMLElement;

    public constructor(containerSelector: string) {
        const container: Element | null = document.querySelector(containerSelector);
        if (!container) throw new Error(`Container ${containerSelector} niet gevonden`);
        this.container = container as HTMLElement;
    }

    public async render(): Promise<void> {
        const cartItems: CartItem[] = await this.fetchCartItems();
        this.container.innerHTML = "";

        if (cartItems.length === 0) {
            this.container.innerHTML = "<p>Je winkelwagen is leeg.</p>";
            return;
        }

        let totaal: number = 0;
        cartItems.forEach(item => {
            const prijs: number = parseFloat(item.price);
            const totaalItem: number = prijs * item.quantity;
            totaal += totaalItem;

            const div: HTMLDivElement = document.createElement("div");
            div.className = "summary-item";
            div.innerHTML = `
                <div>
                    <img src="${item.thumbnail}" alt="${item.title}" width="50" height="50" />
                    <p>${item.title}</p>
                    <p>€${totaalItem.toFixed(2)}</p>
                </div>
            `;
            this.container.appendChild(div);
        });

        const totaalDiv: HTMLDivElement = document.createElement("div");
        totaalDiv.className = "summary-total";
        totaalDiv.innerHTML = `
            <p>Subtotaal: €${totaal.toFixed(2)}</p>
            <p>Verzendkosten: €0,00</p>
            <p><strong>Totaal: €${totaal.toFixed(2)}</strong></p>
        `;
        this.container.appendChild(totaalDiv);
    }

    private async fetchCartItems(): Promise<CartItem[]> {
        const res: Response = await fetch("http://localhost:3001/cart", {
            credentials: "include",
        });
        if (!res.ok) throw new Error("Kan cart items niet ophalen");
        const data: { cart: CartItem[] } = await res.json() as { cart: CartItem[] };
        return data.cart;
    }
}

// Test suite
describe("CartSummaryComponent", () => {
    let container: HTMLElement;
    let component: CartSummaryComponent;

    beforeEach(() => {
        // Setup
        container = document.createElement("div");
        container.id = "test-container";
        document.body.appendChild(container);
        component = new CartSummaryComponent("#test-container");
    });

    afterEach(() => {
        // Cleanup
        document.body.removeChild(container);
    });

    test("should show empty cart message when cart is empty", async () => {
        // Mock fetch response
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ cart: [] }),
        });

        await component.render();
        expect(container.innerHTML).toContain("Je winkelwagen is leeg");
    });

    test("should calculate total correctly", async () => {
        // Mock cart data
        const mockCart: { cart: CartItem[] } = {
            cart: [
                {
                    id: 1,
                    game_id: 101,
                    quantity: 2,
                    price: "29.99",
                    title: "Test Game",
                    thumbnail: "test.jpg",
                },
            ],
        };

        // Mock fetch response
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockCart),
        });

        await component.render();
        expect(container.innerHTML).toContain("€59.98"); // 29.99 * 2
    });
});
