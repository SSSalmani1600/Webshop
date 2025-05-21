import { CartSummaryComponent } from "../components/CheckoutproductComponent";

export class Checkout extends HTMLElement {
  connectedCallback(): void {
    this.innerHTML = `
      <main class="checkout-container">
        <section class="checkout-left">
          <h2>Afrekenen</h2>

          <div class="checkout-section">
            <h3>Verzendadres</h3>
            <form id="adresForm">
              <label>Naam <span class="required">*</span></label>
              <input type="text" name="naam" placeholder="Naam" required>

              <label>Straat + Huisnummer <span class="required">*</span></label>
              <input type="text" name="straat_huisnummer" placeholder="Straat + Huisnummer" required>

              <label>Postcode + Plaats <span class="required">*</span></label>
              <input type="text" name="postcode_plaats" placeholder="Postcode + Plaats" required>

              <label>Telefoonnummer <span class="required">*</span></label>
              <input type="text" name="telefoonnummer" placeholder="Telefoonnummer" required>

              <button type="submit" id="place-order" class="checkout-btn">Adres opslaan</button>
            </form>
          </div>
        </section>

        <aside class="checkout-summary">
          <h3>Winkelwagen</h3>
          <div class="summary-item">
            <div>
              <p>Productnaam</p>
              <p>€0,00</p>
            </div>
          </div>
          <hr>
          <div class="summary-total">
            <p>Subtotaal: €0,00</p>
            <p>Verzendkosten: €0,00</p>
            <p><strong>Totaal: €0,00</strong></p>
          </div>
        </aside>
      </main>
    `;

    this.initCartSummary();
    this.initOrderSubmission();
  }

  private initCartSummary(): void {
    const summary = new CartSummaryComponent(".checkout-summary");
    summary.render();
  }

  private initOrderSubmission(): void {
    const form = this.querySelector("#adresForm") as HTMLFormElement;
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const userId = 1;

      const formData = new FormData(form);
      const data = {
        userId,
        naam: (formData.get("naam") || "").toString().trim(),
        straatHuisnummer: (formData.get("straat_huisnummer") || "").toString().trim(),
        postcodePlaats: (formData.get("postcode_plaats") || "").toString().trim(),
        telefoonnummer: (formData.get("telefoonnummer") || "").toString().trim(),
      };

      console.log(" Data naar backend:");
      console.table(data);

      try {
        const res = await fetch("http://localhost:3001/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Kon adres niet opslaan");

        const result = await res.json();
        alert("Adres opgeslagen! Adres ID: " + result.addressId);
      } catch (err) {
        console.error("Fout bij opslaan adres:", err);
        alert("Er is iets misgegaan bij het opslaan van je adres.");
      }
    });
  }
}

customElements.define("webshop-page-checkout", Checkout);
