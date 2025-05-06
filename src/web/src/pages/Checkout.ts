import { CartItem } from "../interfaces/CartItem";
import { CartItemComponent } from "../components/CartItemComponent";
interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  // Functie om cart items op te halen uit de backend
  async function fetchCartItems(): Promise<CartItem[]> {
    const response = await fetch("http://localhost:3000/api/cart"); // pas eventueel de URL aan
    if (!response.ok) throw new Error("Kan cart items niet ophalen");
    return await response.json();
  }
  
  // Genereer HTML voor elk item in de winkelwagen
  function renderCartItems(items: CartItem[]): void {
    const summaryContainer = document.querySelector(".checkout-summary");
    if (!summaryContainer) return;
  
    // Verwijder dummy .summary-item en .summary-total
    summaryContainer.querySelectorAll(".summary-item").forEach(el => el.remove());
    summaryContainer.querySelector(".summary-total")?.remove();
  
    let subtotal = 0;
  
    items.forEach(item => {
      const div = document.createElement("div");
      div.className = "summary-item";
      div.innerHTML = `
        <div>
          <p>${item.name} (${item.quantity})</p>
          <p>€${(item.price * item.quantity).toFixed(2)}</p>
        </div>
      `;
      summaryContainer.appendChild(div);
      subtotal += item.price * item.quantity;
    });
  
    // Voeg totaal toe
    const totalDiv = document.createElement("div");
    totalDiv.className = "summary-total";
    totalDiv.innerHTML = `
      <hr>
      <p>Subtotaal: €${subtotal.toFixed(2)}</p>
      <p>Verzendkosten: €0,00</p>
      <p><strong>Totaal: €${subtotal.toFixed(2)}</strong></p>
    `;
    summaryContainer.appendChild(totalDiv);
  }
  
  // Init
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const cartItems = await fetchCartItems();
      renderCartItems(cartItems);
    } catch (err) {
      console.error("Fout bij ophalen van cart:", err);
    }
  });
  