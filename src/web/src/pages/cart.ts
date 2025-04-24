import { CartItem } from "../interfaces/CartItem";
import { CartItemComponent } from "../components/CartItemComponent";

type CartResponse = { cart: CartItem[] };

async function fetchCart(): Promise<void> {
    try {
        const res: Response = await fetch("http://localhost:3001/cart", {
            credentials: "include",
        });

        const data: CartResponse = await res.json() as CartResponse;
        const cart: CartItem[] = data.cart;
        const container: HTMLElement = document.getElementById("cart-list")!;
        const totalDisplay: HTMLElement = document.getElementById("total-price")!;
        let total: number = 0;

        container.innerHTML = "";

        cart.forEach((item: CartItem) => {
            const element: HTMLElement = new CartItemComponent(item);
            container.appendChild(element);
            total += typeof item.price === "string" ? parseFloat(item.price) * item.quantity : item.price * item.quantity;
        });

        totalDisplay.textContent = `€${total.toFixed(2)}`;
    }
    catch (e) {
        console.error("Fout bij ophalen winkelwagen:", e);
    }
}

void fetchCart();
