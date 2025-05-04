
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch("/checkout");
      const data: CheckoutData = await response.json();
  
      updateCheckoutSummary(data);
    } catch (error) {
      console.error("Fout bij ophalen van checkout-data:", error);
    }
  });
  
  function updateCheckoutSummary(data: CheckoutData) {
    const summaryContainer = document.querySelector(".checkout-summary");
  
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
  