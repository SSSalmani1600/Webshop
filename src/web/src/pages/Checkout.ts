// Interface voor een winkelwagenitem
interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
  }
  
  // Interface voor alle data die nodig is bij checkout
  interface CheckoutData {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    total: number;
  }
  
  // Wanneer de pagina volledig geladen is...
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      // ...probeer de checkout-data op te halen via een fetch-verzoek
      const response = await fetch("/checkout");
      const data: CheckoutData = await response.json();
  
      // Update het overzicht op basis van de ontvangen data
      updateCheckoutSummary(data);
    } catch (error) {
      // Foutmelding als ophalen niet lukt
      console.error("Fout bij ophalen van checkout-data:", error);
    }
  });
  
  // Functie om het checkout-overzicht te vullen op de pagina
  function updateCheckoutSummary(data: CheckoutData) {
    const summaryContainer = document.querySelector(".checkout-summary");
  
    // Genereer HTML voor elk item in de winkelwagen
    const itemList = data.items
      .map(
        (item) => `
        <div class="summary-item">
          <div>
            <p>${item.name} × ${item.quantity}</p>
            <p>€${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>`
      )
      .join("");
  
    // Vul de container met het volledige overzicht inclusief totaalprijs
    summaryContainer!.innerHTML = `
      <h3>Winkelwagen</h3>
      ${itemList}
      <hr>
      <div class="summary-total">
        <p>Subtotaal: €${data.subtotal.toFixed(2)}</p>
        <p>Verzendkosten: €${data.shipping.toFixed(2)}</p>
        <p><strong>Totaal: €${data.total.toFixed(2)}</strong></p>
      </div>
      <button class="checkout-btn">Bestelling plaatsen</button>
    `;
  }
  