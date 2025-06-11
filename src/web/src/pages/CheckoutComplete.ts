import { PaymentService } from "../../src/services/PaymentService";

export class CheckoutComplete extends HTMLElement {
    private readonly API_BASE: string = window.location.hostname.includes("localhost")
        ? "http://localhost:3001"
        : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";
    private readonly _paymentService: PaymentService = new PaymentService();

    public constructor() {
        super();
    }

    public connectedCallback(): void {
        this.render();
        void this.checkPaymentStatus();
    }

    private render(): void {
        this.innerHTML = `
            <main class="checkout-complete">
                <div class="loading">
                    <h2>Betaling verwerken...</h2>
                    <p>Even geduld alstublieft, we controleren uw betaling.</p>
                </div>
            </main>
        `;
    }

    private async checkPaymentStatus(): Promise<void> {
        try {
            // Haal orderId uit URL
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('orderId');

            if (!orderId) {
                this.showError("Geen order ID gevonden");
                return;
            }

            // Haal transaction ID op uit database
            const response = await fetch(`${this.API_BASE}/checkout/payment/${orderId}`, {
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Kan betalingsgegevens niet ophalen");
            }

            const { transactionId } = await response.json();

            // Controleer betalingsstatus
            const status = await this._paymentService.checkPaymentStatus(transactionId);

            if (status === 'paid') {
                // Betaling succesvol
                this.showSuccess(orderId);
            } else if (status === 'canceled') {
                // Betaling geannuleerd
                this.showCancelled();
            } else {
                // Betaling nog open
                this.showPending();
            }
        } catch (error) {
            console.error("Fout bij controleren betaling:", error);
            this.showError("Er ging iets mis bij het controleren van uw betaling");
        }
    }

    private showSuccess(orderId: string): void {
        this.innerHTML = `
            <main class="checkout-complete">
                <div class="success">
                    <h2>✅ Betaling succesvol!</h2>
                    <p>Bedankt voor uw bestelling. Uw ordernummer is: <strong>#${orderId}</strong></p>
                    <p>U ontvangt een bevestiging per e-mail.</p>
                    <a href="/" class="button">Terug naar home</a>
                </div>
            </main>
        `;
    }

    private showCancelled(): void {
        this.innerHTML = `
            <main class="checkout-complete">
                <div class="cancelled">
                    <h2>❌ Betaling geannuleerd</h2>
                    <p>Uw betaling is geannuleerd. U kunt het opnieuw proberen.</p>
                    <a href="/checkout.html" class="button">Terug naar checkout</a>
                </div>
            </main>
        `;
    }

    private showPending(): void {
        this.innerHTML = `
            <main class="checkout-complete">
                <div class="pending">
                    <h2>⏳ Betaling in behandeling</h2>
                    <p>Uw betaling wordt nog verwerkt. Dit kan enkele minuten duren.</p>
                    <p>U ontvangt een bevestiging zodra de betaling is verwerkt.</p>
                    <a href="/" class="button">Terug naar home</a>
                </div>
            </main>
        `;
    }

    private showError(message: string): void {
        this.innerHTML = `
            <main class="checkout-complete">
                <div class="error">
                    <h2>❌ Fout</h2>
                    <p>${message}</p>
                    <a href="/checkout.html" class="button">Terug naar checkout</a>
                </div>
            </main>
        `;
    }
}

customElements.define("webshop-page-checkout-complete", CheckoutComplete); 
