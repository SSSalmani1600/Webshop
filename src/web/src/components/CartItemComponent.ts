import { CartItem } from "../interfaces/CartItem";

export class CartItemComponent extends HTMLElement {
  constructor(item: CartItem) {
    super();

    const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;

    this.innerHTML = `
      <div class="cart-item">
        <img src="${item.thumbnail}" alt="${item.title}">
        <div>
          <h4>${item.title}</h4>
          <p>Prijs: €${price.toFixed(2)}</p>
          <p>Aantal: ${item.quantity}</p>
          <button disabled>Remove item</button>
        </div>
      </div>
    `;
  }
}

customElements.define("cart-item", CartItemComponent);
