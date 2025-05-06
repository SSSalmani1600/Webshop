import { CartItem } from "../interfaces/CartItem";
import { CartItemComponent } from "../components/CartItemComponent";

function renderCartItems(cartItems: CartItem[]): void {
  const summaryContainer = document.querySelector(".checkout-summary");
  if (!summaryContainer) return;

  // Verwijder oude items behalve de kop
  const existingItems = summaryContainer.querySelectorAll(".summary-item");
  existingItems.forEach(item => item.remove());

  const totalContainer = summaryContainer.querySelector(".summary-total");
  if (totalContainer) totalContainer.remove();

  // Voeg nieuwe items toe
  let subtotal = 0;

  cartItems.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.classList.add("summary-item");
    itemElement.innerHTML = `
      <div>
        <p>${item.name} (${item.quantity})</p>
        <p>€${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    `;
    summaryContainer.appendChild(itemElement);
    subtotal += item.price * item.quantity;
  });

  // Voeg totaal toe
  const totaalElement = document.createElement("div");
  totaalElement.classList.add("summary-total");
  totaalElement.innerHTML = `
    <hr>
    <p>Subtotaal: €${subtotal.toFixed(2)}</p>
    <p>Verzendkosten: €0,00</p>
    <p><strong>Totaal: €${subtotal.toFixed(2)}</strong></p>
  `;
  summaryContainer.appendChild(totaalElement);
}

document.addEventListener("DOMContentLoaded", () => {
  const cartItems = getCartItems();
  renderCartItems(cartItems);
});
