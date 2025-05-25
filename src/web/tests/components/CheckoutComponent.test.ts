import { describe, expect, test, beforeEach, afterEach, jest } from "@jest/globals";

interface CartItem {
    id: number;
    game_id: number;
    quantity: number;
    price: string;
    title: string;
    thumbnail: string;
}

interface CartResponse {
    cart: CartItem[];
}

export class CartSummaryComponent {
    private container: HTMLElement;

    public constructor(containerSelector: string) {
        const container: Element | null = document.querySelector(containerSelector);
        if (!container) throw new Error(`Container ${containerSelector} niet gevonden`);
        if (!(container instanceof HTMLElement)) {
            throw new Error(`Container ${containerSelector} is not an HTMLElement`);
        }
        this.container = container;
    }

    public async render(): Promise<void> {
        const cartItems: CartItem[] = await this.fetchCartItems();
        this.container.innerHTML = ""; // clear existing content

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

        const hr: HTMLHRElement = document.createElement("hr");
        this.container.appendChild(hr);

        const totaalDiv: HTMLDivElement = document.createElement("div");
        totaalDiv.className = "summary-total";
        totaalDiv.innerHTML = `
        <p>Subtotaal: €${totaal.toFixed(2)}</p>
        <p>Verzendkosten: €0,00</p>
        <p><strong>Totaal: €${totaal.toFixed(2)}</strong></p>
      `;
        this.container.appendChild(totaalDiv);

        const button: HTMLButtonElement = document.createElement("button");
        button.className = "checkout-btn";
        button.textContent = "Bestelling plaatsen";
        this.container.appendChild(button);
    }

    private async fetchCartItems(): Promise<CartItem[]> {
        const res: Response = await fetch("http://localhost:3001/cart", {
            credentials: "include",
        });
        if (!res.ok) throw new Error("Kan cart items niet ophalen");
        const data: CartResponse = await res.json() as CartResponse;
        return data.cart;
    }
}

// Test suite
describe("CartSummaryComponent", () => {
    let component: CartSummaryComponent;
    let mockContainer: HTMLElement;

    beforeEach(() => {
        // Create a mock container
        mockContainer = document.createElement("div");
        mockContainer.id = "test-container";
        document.body.appendChild(mockContainer);

        // Create component instance
        component = new CartSummaryComponent("#test-container");
    });

    afterEach(() => {
        // Clean up
        document.body.removeChild(mockContainer);
    });

    test("should initialize with correct container", () => {
        expect(component).toBeDefined();
    });

    test("should render empty cart message when cart is empty", async () => {
        // Mock fetch to return empty cart
        const mockFetch: jest.Mock = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ cart: [] }),
            })
        );
        global.fetch = mockFetch as unknown as typeof fetch;

        await component.render();
        expect(mockContainer.innerHTML).toContain("Je winkelwagen is leeg");
    });

    test("should render cart items correctly", async () => {
        // Mock cart data
        const mockCartItems: CartItem[] = [
            {
                id: 1,
                game_id: 101,
                quantity: 2,
                price: "29.99",
                title: "Test Game",
                thumbnail: "test.jpg",
            },
        ];

        // Mock fetch to return cart items
        const mockFetch: jest.Mock = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ cart: mockCartItems }),
            })
        );
        global.fetch = mockFetch as unknown as typeof fetch;

        await component.render();
        // Check if cart items are rendered
        expect(mockContainer.innerHTML).toContain("Test Game");
        expect(mockContainer.innerHTML).toContain("€59.98"); // 29.99 * 2
        expect(mockContainer.innerHTML).toContain("Bestelling plaatsen");
    });

    test("should handle fetch error", async () => {
        // Mock fetch to return error
        const mockFetch: jest.Mock = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
            })
        );
        global.fetch = mockFetch as unknown as typeof fetch;

        await expect(component.render()).rejects.toThrow("Kan cart items niet ophalen");
    });
});
