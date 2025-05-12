import { CartSummaryComponent } from "../components/CheckoutproductComponent";

class CheckoutPageComponent extends HTMLElement {
  connectedCallback(): void {
    this.innerHTML = this.template();
    this.initCheckoutFormStorage();
    this.initOrderSubmission();

    const summary = new CartSummaryComponent(".checkout-summary");
    summary.render().catch((err) => {
      console.error("Fout bij laden van cart component:", err);
    });
  }

  private initCheckoutFormStorage(): void {
    const FORM_KEY = "checkoutFormData";

    const formInputs = this.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "input[type='text'], input[type='email'], input[type='radio'], select"
    );

    const saved = localStorage.getItem(FORM_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      formInputs.forEach((input) => {
        const name = input.name;
        if (!name) return;

        if (input.type === "radio") {
          input.checked = input.value === data[name];
          if (input.checked) input.dispatchEvent(new Event("click"));
        } else {
          input.value = data[name] || "";
        }
      });
    }

    formInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const updatedData: Record<string, string> = {};
        formInputs.forEach((i) => {
          if (!i.name) return;
          if (i.type === "radio") {
            if ((i as HTMLInputElement).checked) {
              updatedData[i.name] = i.value;
            }
          } else {
            updatedData[i.name] = i.value;
          }
        });
        localStorage.setItem(FORM_KEY, JSON.stringify(updatedData));
      });
    });
  }

  private initOrderSubmission(): void {
    const button = this.querySelector("#place-order");
    if (!button) return;

    button.addEventListener("click", async () => {
      const formInputs = this.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        "input[type='text'], input[type='email'], input[type='radio'], select"
      );

      const orderData: Record<string, string> = {};
      formInputs.forEach((input) => {
        if (!input.name) return;
        if (input.type === "radio") {
          if ((input as HTMLInputElement).checked) {
            orderData[input.name] = input.value;
          }
        } else {
          orderData[input.name] = input.value;
        }
      });

      try {
        const res = await fetch("http://localhost:3001/checkout/submit", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (!res.ok) throw new Error("Bestelling verzenden mislukt");

        alert("Bestelling succesvol geplaatst!");
        localStorage.removeItem("checkoutFormData");
      } catch (err) {
        console.error("Fout bij verzenden bestelling:", err);
        alert("Er is iets misgegaan bij het plaatsen van je bestelling.");
      }
    });
  }

  private template(): string {
    return `
      <main class="checkout-container">
        <section class="checkout-left">
          <h2>Afrekenen</h2>

          <div class="checkout-section">
            <h3>Verzendadres</h3>
            <form id="checkout-form">
              <label>Naam <span class="required">*</span></label>
              <input type="text" name="naam" placeholder="Naam" required />

              <label>Straat + Huisnummer <span class="required">*</span></label>
              <input type="text" name="straat" placeholder="Straat + Huisnummer" required />

              <label>Postcode + Plaats <span class="required">*</span></label>
              <input type="text" name="postcode" placeholder="Postcode + Plaats" required />

              <label>Telefoonnummer <span class="required">*</span></label>
              <input type="text" name="telefoon" placeholder="Telefoonnummer" required />
            </form>
          </div>

          <div class="checkout-section">
            <h3>Verzendmethode</h3>
            <label><input type="radio" name="verzending" value="standaard" required /> Standaard - Gratis</label>
            <label><input type="radio" name="verzending" value="express" /> Express - €0,00</label>
          </div>

          <div class="checkout-section">
            <h3>Betaalmethode <span class="required">*</span></h3>

            <label><input type="radio" name="betaling" value="ideal" required /> iDEAL</label>
            <div id="ideal-fields" class="payment-fields hidden">
              <label for="bank-select">Kies je bank <span class="required">*</span></label>
              <select id="bank-select" name="bank" required>
                            <option value=""></option>
                          </select>
                        </div>
            
                        <label><input type="radio" name="betaling" value="creditcard" /> Creditcard</label>
                      </div>
                    </section>
            
                    <section class="checkout-right">
                      <h2>Samenvatting</h2>
                      <div class="checkout-summary"></div>
                      <button id="place-order">Plaats bestelling</button>
                    </section>
                  </main>
                `;
