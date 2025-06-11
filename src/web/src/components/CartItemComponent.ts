import { CartItem } from "../interfaces/CartItem";

// Dit is een component die één product in de winkelwagen laat zien
export class CartItemComponent extends HTMLElement {
    // Deze variabelen slaan alle informatie over het product op
    protected itemPrice: number;
    protected itemQuantity: number;
    protected itemId: number;
    protected itemTitle: string;
    protected itemThumbnail: string;
    protected itemDiscount: number = 0;
    protected discountCode: string | null = null;

    public constructor(item: CartItem) {
        super();
        // Zet de prijs om naar een getal als het een tekst was
        this.itemPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price;
        this.itemQuantity = item.quantity;
        this.itemId = item.id;
        this.itemTitle = item.title;
        this.itemThumbnail = item.thumbnail;
        // Get initial discount code from URL if it exists
        const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
        this.discountCode = urlParams.get("discountCode");
    }

    // Deze functie past een korting toe op het product
    public setDiscount(discountPercentage: number, code?: string): void {
        this.itemDiscount = discountPercentage;
        if (code) {
            this.discountCode = code;
        }
        this.render();
    }

    private async updateQuantity(newQuantity: number): Promise<void> {
        try {
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            // Use the stored discount code
            const url: string = `${API_BASE}/cart/item/${this.itemId}/quantity${this.discountCode ? `?discountCode=${this.discountCode}` : ""}`;

            const response: Response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ quantity: newQuantity }),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to update quantity");
            }

            interface UpdateResponse {
                success: boolean;
                cart: CartItem[];
                subtotal: number;
                total: number;
                discountPercentage: number;
            }

            const data: UpdateResponse = await response.json() as UpdateResponse;
            if (data.success) {
                // Update the quantity
                this.itemQuantity = newQuantity;

                // Update the discount percentage from the response
                if (typeof data.discountPercentage === "number") {
                    this.itemDiscount = data.discountPercentage;
                }

                // Find our updated item in the cart
                const updatedItem: CartItem | undefined = data.cart.find(item => item.id === this.itemId);
                if (updatedItem) {
                    // Update the base price if it changed
                    this.itemPrice = typeof updatedItem.price === "string" ? parseFloat(updatedItem.price) : updatedItem.price;
                }

                // Get the total price for this item from the backend data
                const updatedItemTotal: number = this.itemPrice * this.itemQuantity;
                const updatedItemDiscounted: number = updatedItemTotal * (1 - this.itemDiscount / 100);

                // Update quantity display
                const quantityDisplay: HTMLElement | null = this.querySelector(".quantity-display");
                if (quantityDisplay) {
                    quantityDisplay.textContent = this.itemQuantity.toString();
                }

                // Always show both prices when there's a discount
                const priceContainer: HTMLElement | null = this.querySelector(".price-container");
                if (priceContainer) {
                    priceContainer.innerHTML = `
                        ${this.itemDiscount > 0 ? `<span class="original-price">€${updatedItemTotal.toFixed(2)}</span>` : ""}
                        <div class="item-price">€${updatedItemDiscounted.toFixed(2)}</div>
                    `;
                }

                // Dispatch event to update cart totals
                this.dispatchEvent(new CustomEvent("quantity-updated", {
                    detail: {
                        cart: data.cart,
                        subtotal: data.subtotal,
                        total: data.total,
                        discountPercentage: data.discountPercentage,
                    },
                    bubbles: true,
                    composed: true,
                }));

                // Update navbar cart counter
                document.dispatchEvent(new CustomEvent("cart-updated"));
            }
        }
        catch (error) {
            console.error("Error updating quantity:", error);
            // Revert the display back to the original quantity
            const quantityDisplay: HTMLElement | null = this.querySelector(".quantity-display");
            if (quantityDisplay) {
                quantityDisplay.textContent = this.itemQuantity.toString();
            }
        }
    }

    // Deze functie maakt de HTML voor het product
    public render(): void {
        // Get the total price for this item
        const totalPrice: number = this.itemPrice * this.itemQuantity;
        const discountedPrice: number = totalPrice * (1 - this.itemDiscount / 100);
        const roundedDiscountedPrice: number = parseFloat(discountedPrice.toFixed(2));

        this.innerHTML = `
            <style>
                .cart-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: stretch;
                    background-color: #222121;
                    border-radius: 6px;
                    padding: 0.8rem;
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
                    justify-content: center;
                    padding: 0 1rem;
                    flex: 1;
                }

                .item-title {
                    margin: 0 0 0.4rem 0;
                    font-size: 1rem;
                }

                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin: 0.5rem 0;
                }

                .quantity-button {
                    background-color: #333;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    width: 24px;
                    height: 24px;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .quantity-button:hover {
                    background-color: #444;
                }

                .quantity-display {
                    background-color: #333;
                    color: white;
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    min-width: 30px;
                    text-align: center;
                }

                .price-actions {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: flex-end;
                    min-width: 100px;
                }

                .item-price {
                    font-weight: bold;
                    font-size: 1rem;
                    color: white;
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

                .delete-button {
                    background: none;
                    border: none;
                    color: white;
                    text-decoration: underline;
                    font-size: 0.8rem;
                    cursor: pointer;
                    padding: 0;
                }

                @media (max-width: 768px) {
                    .cart-item {
                        flex-direction: column;
                    }

                    .cart-item img {
                        width: 100%;
                        height: auto;
                    }

                    .price-actions {
                        align-items: flex-start;
                        margin-top: 1rem;
                    }
                }
            </style>

            <div class="cart-item" data-id="${this.itemId}">
                <img src="${this.itemThumbnail}" alt="${this.itemTitle}">
                <div class="item-details">
                    <h4 class="item-title">${this.itemTitle}</h4>
                    <div class="quantity-controls">
                        <button class="quantity-button decrease">-</button>
                        <span class="quantity-display">${this.itemQuantity}</span>
                        <button class="quantity-button increase">+</button>
                    </div>
                </div>

                <div class="price-actions">
                    <div class="price-container">
                        ${this.itemDiscount > 0 ? `<span class="original-price">€${totalPrice.toFixed(2)}</span>` : ""}
                        <div class="item-price">€${roundedDiscountedPrice.toFixed(2)}</div>
                    </div>
                    <button class="delete-button">Verwijder uit winkelwagen</button>
                </div>
            </div>
        `;

        // Add event listeners for quantity controls
        const decreaseBtn: HTMLButtonElement | null = this.querySelector(".decrease");
        const increaseBtn: HTMLButtonElement | null = this.querySelector(".increase");
        const quantityDisplay: HTMLElement | null = this.querySelector(".quantity-display");

        if (decreaseBtn && increaseBtn && quantityDisplay) {
            decreaseBtn.addEventListener("click", () => {
                if (this.itemQuantity > 1) {
                    void this.updateQuantity(this.itemQuantity - 1);
                }
            });

            increaseBtn.addEventListener("click", () => {
                void this.updateQuantity(this.itemQuantity + 1);
            });
        }

        // Add delete button event listener
        const deleteButton: HTMLButtonElement | null = this.querySelector(".delete-button");
        if (deleteButton) {
            deleteButton.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent("item-delete", {
                    detail: { id: this.itemId },
                    bubbles: true,
                    composed: true,
                }));
            });
        }
    }

    // Deze functie wordt aangeroepen als de component aan de pagina wordt toegevoegd
    public connectedCallback(): void {
        this.render();
    }
}

// Registreer de component zodat we deze kunnen gebruiken in HTML
customElements.define("cart-item", CartItemComponent);
