declare const VITE_API_URL: string;

export class NavbarComponent extends HTMLElement {
    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.render();
        this.updateCartCount();
        document.addEventListener("cart-updated", () => {
            this.updateCartCount();
        });
    }

    private render(): void {
        this.shadowRoot!.innerHTML = `
        <style>
        nav {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            padding: 1rem 2rem;
            background-color: #222;
            color: white;
            font-family: 'Inter', sans-serif;
        }

        .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.5rem;
        font-weight: bold;
        color: white;
        }

        .logo img {
        width: 24px;
        height: 24px;
        display: block;
        }

        .nav-links {
            display: flex;
            justify-content: center;
            gap: 20px;
        }

        .nav-links a {
            color: white;
            text-decoration: none;
            font-size: 1rem;
            padding: 6px 12px;
            border-radius: 6px;
            transition: background-color 0.2s ease;
        }

        .nav-links a:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: #7f41f5;
        }

        .cart {
            justify-self: end;
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: center;
        }

        .cart img {
            width: 24px;
            height: 24px;
            display: block;
        }

        .cart-count {
            position: absolute;
            top: -6px;
            right: -10px;
            background-color: red;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 0.75rem;
        }
        </style>

        <nav>
        <div class="logo">
            <img src="/assets/images/logo.svg" alt="Logo" />
            <span>GameShop</span>
        </div>

        <div class="nav-links">
            <a href="index.html">Home</a>
            <a href="product.html">Games</a>
        </div>

        <div class="cart" id="cart">
            <img src="/assets/images/cart_empty.png" alt="Cart icon" />
            <span class="cart-count" id="cart-count">0</span>
        </div>
        </nav>       
    `;
        if (!this.shadowRoot) return;

        const el: Element | null = this.shadowRoot.getElementById("cart");
        if (el instanceof HTMLElement) {
            el.addEventListener("click", () => {
                window.location.href = "cart.html";
            });
        }
    }

    public updateCartCount(): void {
        // Eerst controleren of shadowRoot bestaat
        if (!this.shadowRoot) return;

        fetch(`${VITE_API_URL}cart/count`, { credentials: "include" })
            .then((res: Response) => {
                if (!res.ok) throw new Error("Cart count ophalen mislukt");
                return res.json();
            })
            .then((data: { count: number }) => {
                const span: Element | null = this.shadowRoot!.getElementById("cart-count");
                if (span instanceof HTMLElement) {
                    span.textContent = data.count.toString();
                }
            })
            .catch((err: unknown) => {
                const span: Element | null = this.shadowRoot!.getElementById("cart-count");
                if (span instanceof HTMLElement) {
                    span.textContent = "0";
                }

                if (err instanceof Error) {
                    console.error("Fout bij ophalen winkelmand teller:", err.message);
                }
                else {
                    console.error("Onbekende fout:", err);
                }
            });
    }
}

customElements.define("navbar-component", NavbarComponent);
