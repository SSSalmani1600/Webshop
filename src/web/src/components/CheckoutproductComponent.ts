interface CartItem {
    id: number;
    game_id: number;
    quantity: number;
    price: string;
    title: string;
    thumbnail: string;
  }
  
  export class CartSummaryComponent {
    private container: HTMLElement;
  
    constructor(containerSelector: string) {
      const container = document.querySelector(containerSelector);
      if (!container) throw new Error(`Container ${containerSelector} niet gevonden`);
      this.container = container;
    }
  
    async render(): Promise<void> {
      const cartItems = await this.fetchCartItems();
      this.container.innerHTML = ""; // clear existing content
  
      if (cartItems.length === 0) {
        this.container.innerHTML = "<p>Je winkelwagen is leeg.</p>";
        return;
      }
  
      let totaal = 0;
  
      cartItems.forEach((item) => {
        const prijs = parseFloat(item.price);
        const totaalItem = prijs * item.quantity;
        totaal += totaalItem;
  
        const div = document.createElement("div");
        div.className = "summary-item";
        div.innerHTML = `
          <div>
            <img src="${item.thumbnail}" alt="${item.title}" width="50" height="50" />
            <p>${item.title}</p>
            <p>€${totaalItem.toFixed(2)}</p>
          </div>
        `;
        this.container.appendChild(div);
      });
  
      const hr = document.createElement("hr");
      this.container.appendChild(hr);
  
      const totaalDiv = document.createElement("div");
      totaalDiv.className = "summary-total";
      totaalDiv.innerHTML = `
        <p>Subtotaal: €${totaal.toFixed(2)}</p>
        <p>Verzendkosten: €0,00</p>
        <p><strong>Totaal: €${totaal.toFixed(2)}</strong></p>
      `;
      this.container.appendChild(totaalDiv);
  
      const button = document.createElement("button");
      button.className = "checkout-btn";
      button.textContent = "Bestelling plaatsen";
      this.container.appendChild(button);
    }
  
    private async fetchCartItems(): Promise<CartItem[]> {
      const res = await fetch("http://localhost:3001/cart", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Kan cart items niet ophalen");
      const data = await res.json();
      return data.cart;
    }
  }
  
