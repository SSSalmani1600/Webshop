import { CartItem } from "../interfaces/CartItem";
import { CartItemComponent } from "../components/CartItemComponent";

async function fetchCart(): Promise<void> {
  try {
    const res = await fetch("http://localhost:3001/cart", {
      credentials: "include"
    });

    const data = await res.json();
    const cart: CartItem[] = data.cart;
    const container = document.getElementById("cart-list")!;
    const totalDisplay = document.getElementById("total-price")!;
    let total = 0;

    container.innerHTML = "";

    cart.forEach(item => {
      const element = new CartItemComponent(item);
      container.appendChild(element);
      total += typeof item.price === "string" ? parseFloat(item.price) * item.quantity : item.price * item.quantity;
    });

    totalDisplay.textContent = `€${total.toFixed(2)}`;
  } catch (e) {
    console.error("Fout bij ophalen winkelwagen:", e);
  }
}

fetchCart();
