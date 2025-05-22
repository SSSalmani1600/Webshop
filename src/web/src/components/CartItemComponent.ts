import { CartItem } from "../interfaces/CartItem";

export class CartItemComponent extends HTMLElement {
    protected itemPrice: number;
    protected itemQuantity: number;
    protected itemId: number;
    protected itemTitle: string;
    protected itemThumbnail: string;
    protected itemDiscount: number = 0;

    public constructor(item: CartItem) {
        super();
        this.itemPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price;
        this.itemQuantity = item.quantity;
        this.itemId = item.id;
        this.itemTitle = item.title;
        this.itemThumbnail = item.thumbnail;
    }

    public setDiscount(discountPercentage: number): void {
        this.itemDiscount = discountPercentage;
        this.render();
    }

    public render(): void {
        const discountedPrice: number = this.itemPrice * (1 - this.itemDiscount / 100);
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

                .item-quantity {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #ccc;
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
            </style>

            <div class="cart-item" data-id="${this.itemId}">
                <img src="${this.itemThumbnail}" alt="${this.itemTitle}">
                <div class="item-details">
                    <h4 class="item-title">${this.itemTitle}</h4>
                    <p class="item-quantity">Aantal: ${this.itemQuantity}</p>
                </div>

                <div class="price-actions">
                    <div class="price-container">
                        ${this.itemDiscount > 0 ? `<span class="original-price">€${this.itemPrice.toFixed(2)}</span>` : ""}
                        <div class="item-price">€${roundedDiscountedPrice.toFixed(2)}</div>
                    </div>
                    <button class="delete-button">Verwijder uit winkelwagen</button>
                </div>
            </div>
        `;

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

    public connectedCallback(): void {
        this.render();
    }
}

customElements.define("cart-item", CartItemComponent);
