export class NavbarComponent extends HTMLElement {
    private _shadow!: ShadowRoot;

    public constructor() {
        super();
        this._shadow = this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.render();
        this.updateCartCount();
        void this.updateAuthStatus();

        // Listen for cart updates
        document.addEventListener("cart-updated", () => {
            this.updateCartCount();
        });

        // Check login status every 5 seconds
        setInterval(() => {
            void this.updateAuthStatus();
        }, 5000);
    }

    private render(): void {
        this._shadow.innerHTML = `
            <style>
                nav {
                    display: grid;
                    grid-template-columns: auto 1fr auto auto;
                    align-items: center;
                    padding: 1rem 2rem;
                    background-color: #222;
                    color: white;
                    font-family: 'Inter', sans-serif;
                    gap: 1rem;
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
                    color: white;
                }

                .search {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .search input {
                    padding: 6px 10px;
                    border-radius: 6px;
                    border: none;
                    font-size: 1rem;
                }

                .search button {
                    background-color: #7f41f5;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                }

                .right-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .auth-links {
                    display: flex;
                    align-items: center;
                    margin-left: auto;
                }

                .auth-links a {
                    color: white;
                    text-decoration: none;
                    font-size: 1rem;
                    padding: 6px 12px;
                    border-radius: 6px;
                    transition: background-color 0.2s ease;
                }

                .auth-links a:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .logout-button {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 6px 12px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1rem;
                    transition: background-color 0.2s ease;
                }

                .logout-button:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .logout-button img {
                    width: 20px;
                    height: 20px;
                    filter: brightness(0) invert(1);
                }

                .cart {
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
                    <span>LucaStars</span>
                </div>

                <div class="nav-links">
                    <a href="index.html">Home</a>
                    <a href="product.html">Games</a>
                    <a href="wishlist.html">Favorieten</a>
                </div>

                <div class="search">
                    <input type="text" id="search-input" placeholder="Zoek games..." />
                    <button id="search-btn">🔍</button>
                </div>

                <div class="right-section">
                    <div class="cart" id="cart">
                        <img src="/assets/images/cart_empty.png" alt="Cart icon" />
                        <span class="cart-count" id="cart-count">0</span>
                    </div>
                    <div class="auth-links" id="auth-buttons">
                        <!-- This will be dynamically updated -->
                    </div>
                </div>
            </nav>
        `;

        this.setupEventListeners();
    }

    private async updateAuthStatus(): Promise<void> {
        const authButtons: HTMLButtonElement | null = this._shadow.getElementById("auth-buttons") as HTMLButtonElement;

        try {
            const response: Response = await fetch(`${VITE_API_URL}welcome`, {
                credentials: "include",
            });

            const data: { message: string } = await response.json() as { message: string };

            if (data.message && data.message !== "Hello world!") {
                // User is logged in
                authButtons.innerHTML = `
                    <button class="logout-button" id="logout-btn">
                        <img src="/assets/images/logout.svg" alt="Logout" />
                        Uitloggen
                    </button>
                `;

                // Add logout event listener
                const logoutBtn: HTMLButtonElement | null = this._shadow.getElementById("logout-btn") as HTMLButtonElement;
                if (logoutBtn instanceof HTMLElement) {
                    logoutBtn.addEventListener("click", async () => {
                        try {
                            const response: Response = await fetch(`${VITE_API_URL}auth/logout`, {
                                method: "POST",
                                credentials: "include",
                            });

                            if (response.ok) {
                                // Clear any client-side session data
                                localStorage.clear();
                                sessionStorage.clear();

                                // Update UI immediately to show login/register
                                authButtons.innerHTML = `
                                    <a href="login.html">Inloggen/Registreren</a>
                                `;

                                // Refresh the page
                                window.location.reload();
                            }
                        }
                        catch (error: unknown) {
                            console.error("Error during logout:", error);
                        }
                    });
                }
            }
            else {
                // User is not logged in
                authButtons.innerHTML = `
                    <a href="login.html">Inloggen/Registreren</a>
                `;
            }
        }
        catch (error: unknown) {
            console.error("Error checking auth status:", error);
            // Default to showing login link
            authButtons.innerHTML = `
                <a href="login.html">Inloggen/Registreren</a>
            `;
        }
    }

    private setupEventListeners(): void {
        const cartEl: HTMLButtonElement | null = this._shadow.getElementById("cart") as HTMLButtonElement;
        if (cartEl instanceof HTMLElement) {
            cartEl.addEventListener("click", () => {
                window.location.href = "cart.html";
            });
        }

        const searchBtnEl: HTMLButtonElement | null = this._shadow.getElementById("search-btn") as HTMLButtonElement;
        const searchInputEl: HTMLInputElement | null = this._shadow.getElementById("search-input") as HTMLInputElement;

        if (searchBtnEl instanceof HTMLElement && searchInputEl instanceof HTMLInputElement) {
            searchBtnEl.addEventListener("click", () => {
                const query: string = searchInputEl.value.trim();
                if (query) {
                    window.location.href = `/search.html?query=${encodeURIComponent(query)}`;
                }
            });

            searchInputEl.addEventListener("keypress", (e: KeyboardEvent) => {
                if (e.key === "Enter") {
                    const query: string = searchInputEl.value.trim();
                    if (query) {
                        window.location.href = `/search.html?query=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }

    public updateCartCount(): void {
        fetch(`${VITE_API_URL}cart/count`, { credentials: "include" })
            .then((res: Response) => {
                if (!res.ok) throw new Error("Cart count ophalen mislukt");
                return res.json();
            })
            .then((data: { count: number }) => {
                const span: HTMLElement | null = this._shadow.getElementById("cart-count");
                if (span instanceof HTMLElement) {
                    span.textContent = data.count.toString();
                }
            })
            .catch((err: unknown) => {
                const span: HTMLElement | null = this._shadow.getElementById("cart-count");
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
