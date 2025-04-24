import { CartItem } from "../interfaces/CartItem";

export class CartItemComponent extends HTMLElement {
    public constructor(item: CartItem) {
        super();

        const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;

        this.innerHTML = `
  <div class="cart-item">
    <img src="${item.thumbnail}" alt="${item.title}">
    <div class="item-details">
      <h4 class="item-title">${item.title}</h4>
      <p class="item-quantity">Aantal: ${item.quantity}</p>
    </div>
    <div class="item-price">€${price.toFixed(2)}</div>
  </div>
`;
    }
}

customElements.define("cart-item", CartItemComponent);
