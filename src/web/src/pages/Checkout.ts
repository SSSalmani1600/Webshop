import { CartItem } from "../interfaces/CartItem";
import { CartItemComponent } from "../components/CartItemComponent";
interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  async function fetchCartItems(): Promise<CartItem[]> {
    const response: Response = await fetch("http://localhost:3001/cart", {
      credentials: "include", // belangrijk: stuurt sessie/cookies mee
    });
  
    if (!response.ok) {
      throw new Error("Kan cart items niet ophalen");
    }
  
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
  