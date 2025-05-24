export class NavbarComponent {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback(): void {
        this.render();
        this.updateCartCount();
    }

    render(): void {
        this.shadowRoot!.innerHTML = `
        <style>
        nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #222;
          color: white;
        }

        .logo {
          font-size: 1.5rem;
        }

        .cart {
          position: relative;
          cursor: pointer;
        }

        .cart-count {
          position: absolute;
          top: -5px;
          right: -10px;
          background-color: red;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 0.8rem;
        }
      </style>
      <nav>
        <div class="logo">GameShop</div>
        <div class="cart" id="cart">
          🛒 <span class="cart-count" id="cart-count">0</span>
        </div>
      </nav>        
    `;

        const cart: HTMLElement | null = this.shadowRoot!.getElementById("cart");
        if (cart) {
            cart.addEventListener("click", () => {
                window.location.href = "cart.html";
            });
        }
    }

    public updateCartCount(): void {
        fetch("/api/cart/count", { credentials: "include" })
            .then((res: Response) => {
                if (!res.ok) throw new Error("Cart count ophalen mislukt");
                return res.json();
            })
            .then((data: { count: number }) => {
                const countSpan: HTMLElement | null = this.shadowRoot!.getElementById("cart-count");
                if (countSpan) {
                    countSpan.textContent = data.count.toString();
                }
            })
            .catch((err: unknown) => {
                if (err instanceof Error) {
                    console.error("Fout bij ophalen winkelmand teller:", err.message);
                } else {
                    console.error("Onbekende fout:", err);
                }

                const countSpan: HTMLElement | null = this.shadowRoot!.getElementById("cart-count");
                if (countSpan) {
                    countSpan.textContent = "0";
                }
            });
    }
}
