import "@web/components/OrderCompleteComponent";
import { html } from "@web/helpers/webComponents";

export class OrderCompletePageComponent extends HTMLElement {
    public connectedCallback(): void {
        this.attachShadow({ mode: "open" });
        this.render();
    }

    private render(): void {
        if (!this.shadowRoot) return;

<<<<<<< HEAD
        // eslint-disable-next-line @typescript-eslint/typedef
        const container = document.createElement("div");
        container.classList.add("order-wrapper");
        container.innerHTML = `
        <div class="order-container">
          <div class="header-bar">
            <span class="logo">LucaStars</span>
            <a class="contact-link" href="#">Contact Us</a>
          </div>
          <div class="check-icon">✔</div>
          <div class="order-content">
            <h1>Bedankt voor uw bestelling!</h1>
            <p>U ontvangt binnen enkele minuten een bevestiging per mail.</p>
            <p class="order-number">Ordernummer: <strong>#123456</strong></p>
            <div class="order-box">
              <h2>Uw bestelling</h2>
              <div class="order-item"><span>1× Cyberpunk 2077</span><span>€59,99</span></div>
              <div class="order-item"><span>2× Elden Ring</span><span>€69,99</span></div>
              <div class="order-total"><span>Totaal:</span><span>€129,98</span></div>
            </div>
            <a class="return-home" href="/index.html">Terug naar Home</a>
          </div>
        </div>
      `;
=======
        const element: HTMLElement = html`
      <div>
        <h1>Bedankt voor je bestelling</h1>
        <order-confirmation></order-confirmation>
      </div>
    `;
>>>>>>> 342cf3aab8be4d40f84e5e61bd765b1fc95fe84b

        this.shadowRoot.firstChild?.remove();
        this.shadowRoot.append(element);
    }
}

window.customElements.define("webshop-page-order-complete", OrderCompletePageComponent);
