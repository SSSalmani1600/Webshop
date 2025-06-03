import type { BoughtGame } from "@api/types/BoughtGames";

export class OrderCompleteComponent extends HTMLElement {
    private shadow: ShadowRoot;

    public constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.renderLoading();
        void this.loadOrder();
        void this.clearCart();
    }

    private renderLoading(): void {
        this.shadow.innerHTML = "<p style=\"color: white;\">Bestelling wordt geladen...</p>";
    }

    private async loadOrder(): Promise<void> {
        try {
            const response: Response = await fetch("http://localhost:3001/order/complete", {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Kon bestelling niet ophalen");

            const games: BoughtGame[] = await response.json() as BoughtGame[];
            this.renderOrder(games);
        }
        catch (error) {
            this.shadow.innerHTML = `<p style="color: red;">Fout: ${(error as Error).message}</p>`;
        }
    }

    private async clearCart(): Promise<void> {
        try {
            await fetch("http://localhost:3001/cart/clear", {
                method: "DELETE",
                credentials: "include",
            });
        }
        catch (error) {
            console.error("Fout bij legen van winkelmandje:", error);
        }
    }

    private renderOrder(games: BoughtGame[]): void {
        const total: number = games.reduce(
            (sum: number, game: BoughtGame): number => sum + game.quantity * game.price,
            0
        );

        const itemsHtml: string = games.map((game: BoughtGame): string => {
            const linePrice: number = game.quantity * game.price;
            return `
    <div class="order-item">
      <span>${game.quantity}× ${game.title}</span>
      <span>€${linePrice.toFixed(2)}</span>
    </div>`;
        }).join("");

        this.shadow.innerHTML = `
      <style>
        .order-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          padding: 3rem 1rem;
          background-color: #0e0e0e;
          color: white;
          font-family: 'Segoe UI', sans-serif;
        }
        .order-container {
          width: 100%;
          max-width: 420px;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .header-bar .logo {
          font-size: 1.25rem;
          font-weight: bold;
          color: #9333ea;
        }
        .header-bar .contact-link {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
        }
        .header-bar .contact-link:hover {
          color: white;
        }
        .check-icon {
          background-color: #22c55e;
          width: 56px;
          height: 56px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin: 0 auto 1.5rem;
        }
        .order-content {
          text-align: center;
        }
        .order-content h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .order-content p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.5rem;
        }
        .order-number {
          margin-bottom: 2rem;
          font-size: 1rem;
        }
        .order-box {
          background-color: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }
        .order-box h2 {
          margin: 0 0 0.75rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }
        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
        }
        .order-total {
          display: flex;
          justify-content: space-between;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: bold;
        }
        .return-home {
          display: inline-block;
          background-color: #7c3aed;
          padding: 0.5rem 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          color: white;
          font-weight: 500;
          text-align: center;
        }
        .return-home:hover {
          background-color: #6d28d9;
        }
      </style>

      <div class="order-wrapper">
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
              ${itemsHtml}
              <div class="order-total"><span>Totaal:</span><span>€${total.toFixed(2)}</span></div>
            </div>
            <a class="return-home" href="/">Terug naar Home</a>
          </div>
        </div>
      </div>
    `;
    }
}

customElements.define("order-confirmation", OrderCompleteComponent);
