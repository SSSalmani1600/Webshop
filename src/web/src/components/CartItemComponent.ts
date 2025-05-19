import { CartItem } from "../interfaces/CartItem";

export class CartItemComponent extends HTMLElement {
    public constructor(item: CartItem) {
        super();

        const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;

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
 
    

    <div class="cart-item" data-id="${item.id}">
        <img src="${item.thumbnail}" alt="${item.title}">
        <div class="item-details">
        <h4 class="item-title">${item.title}</h4>
        <p class="item-quantity">Aantal: ${item.quantity}</p>
    </div>

    <div class="price-actions">
      <div class="item-price">€${price.toFixed(2)}</div>
      <button class="delete-button">Verwijder uit winkelwagen</button>
    </div>
  </div>
    `;

        const deleteButton: HTMLButtonElement | null = this.querySelector(".delete-button");
        deleteButton?.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("item-delete", {
                bubbles: true,
                composed: true,
                detail: { id: item.id },
            }));
        });
    }
}

customElements.define("cart-item", CartItemComponent);
