interface CartItem {
    id: number;
    title: string;
    price: number;
    quantity: number;
    thumbnail: string;
}

interface CartData {
    cart: CartItem[];
    subtotal: number;
    total: number;
}

interface OrderResponse {
    orderId: number;
    orderNumber: number;
}

interface UserSessionData {
    userId: number;
}

interface CheckoutFormData {
    userId: number;
    naam: string;
    straatHuisnummer: string;
    postcodePlaats: string;
    telefoonnummer: string;
}

export class Checkout extends HTMLElement {
    private readonly API_BASE: string = window.location.hostname.includes("localhost")
        ? "http://localhost:3001"
        : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

    public constructor() {
        super();
    }

    // Zodra pagina opent → dingen laten zien op scherm + winkelwagen ophalen
    public connectedCallback(): void {
        this.render(); // dingen op scherm zetten
        void this.loadCartItems(); // spullen uit winkelwagen ophalen
    }

    // Hier wordt alles op het scherm gezet (adresformulier + winkelwagen)
    private render(): void {
        this.innerHTML = `
            <main class="checkout-container">
                <section class="checkout-left">
                    <h2>Afrekenen</h2>

                    <div class="checkout-section">
                        <h3>Verzendadres</h3>
                        <form id="adresForm">
                            <label>Naam <span class="required">*</span></label>
                            <input type="text" name="naam" placeholder="Bijv. Henk Biervliet" required>

                            <label>Straat + Huisnummer <span class="required">*</span></label>
                            <input type="text" name="straat_huisnummer" placeholder="Bijv. Parklaan 12A" required>

                            <label>Postcode + Plaats <span class="required">*</span></label>
                            <input type="text" name="postcode_plaats" placeholder="Bijv. 1234 AB Amsterdam" required>

                            <label>Telefoonnummer <span class="required">*</span></label>
                            <input type="text" name="telefoonnummer" placeholder="Bijv. 0612345678" required>

                            <button type="submit" id="place-order" class="checkout-btn">Adres opslaan en door naar betaling.</button>
                        </form>
                    </div>
                </section>

                <aside class="checkout-summary">
                    <h3>Winkelwagen</h3>
                    <!-- hier komen straks de games te staan -->
                </aside>
            </main>
        `;

        this.initOrderSubmission(); // knop activeren
    }

    // Dit zorgt dat adres wordt verstuurd als je op knop klikt
    private initOrderSubmission(): void {
        const form: HTMLFormElement | null = this.querySelector("#adresForm");
        if (!form) return;

        // als iemand op knop klikt
        form.addEventListener("submit", async (event: Event) => {
            event.preventDefault(); // voorkomt dat pagina opnieuw laadt

            let userId: number;
            try {
                userId = await this.getUserId(); // wie is ingelogd?
                console.log("Gebruiker ID:", userId);
            }
            catch (error) {
                console.error("Kan gebruiker niet vinden:", error);
                alert("Je bent niet ingelogd. Log eerst in.");
                return;
            }

            // info uit formulier halen
            const formData: FormData = new FormData(form);
            const data: CheckoutFormData = {
                userId,
                naam: this.getFormValue(formData, "naam").trim(),
                straatHuisnummer: this.getFormValue(formData, "straat_huisnummer").trim(),
                postcodePlaats: this.getFormValue(formData, "postcode_plaats").trim().toUpperCase(),
                telefoonnummer: this.getFormValue(formData, "telefoonnummer").trim(),
            };

            console.table(data);

            try {
                // stuur adres naar server
                const res: Response = await fetch(`${this.API_BASE}/checkout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(data),
                });

                if (!res.ok) throw new Error("Fout bij opslaan");

                const cartRes: Response = await fetch(`${this.API_BASE}/cart`, {
                    credentials: "include",
                });
                const cartData: CartData = await cartRes.json() as CartData;
                const totalPrice: number = cartData.total;

                const orderRes: Response = await fetch(`${this.API_BASE}/order/complete`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ totalPrice }),
                });

                if (!orderRes.ok) throw new Error("Bestelling plaatsen mislukt");

                const result: OrderResponse = await orderRes.json() as OrderResponse;

                // 3. Redirect naar order complete
                window.location.href = `/example.html?orderId=${result.orderId}&orderNumber=${result.orderNumber}`;
            }
            catch (error: unknown) {
                const errorMsg: string = error instanceof Error ? error.message : String(error);
                alert("Fout bij afronden bestelling: " + errorMsg);
            }
        });
    }

    // Haalt games uit winkelwagen op en laat ze zien
    private async loadCartItems(): Promise<void> {
        try {
            const res: Response = await fetch(`${this.API_BASE}/cart`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Kan winkelwagen niet ophalen");

            const data: CartData = await res.json() as CartData;
            const cartItems: CartItem[] = data.cart;
            const subtotal: number = data.subtotal;
            const total: number = data.total;

            const summarySection: Element | null = this.querySelector(".checkout-summary");
            if (!summarySection) return;

            // zet games op het scherm
            const itemsHtml: string = cartItems.map((item: CartItem) => `
                <div class="summary-item">
                    <div class="summary-game" style="display: flex; gap: 12px; margin-bottom: 12px;">
                        <img src="${item.thumbnail}" alt="${item.title}" style="width: 200px; height: 150px; border-radius: 8px;">
                        <div>
                            <p><strong>${item.title}</strong></p>
                            <p>Aantal: ${item.quantity}</p>
                            <p>Prijs per stuk: €${item.price.toFixed(2)}</p>
                            <p>Totaal: €${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `).join("");

            // zet totaal onderaan
            summarySection.innerHTML += `
                ${itemsHtml}
                <hr style="border: none; border-top: 1px solid #444; margin: 16px 0;">
                <div class="summary-total" style="font-size: 14px; color: #eee; line-height: 1.6;">
                    <p style="margin: 4px 0;">Subtotaal: <strong>€${subtotal.toFixed(2)}</strong></p>
                    <p style="margin: 4px 0;">Verzendkosten: <strong>€0,00</strong></p>
                    <p style="margin: 4px 0;"><strong style="font-size: 16px;">Totaal: €${total.toFixed(2)}</strong></p>
                </div>
            `;
        }
        catch (error) {
            console.error("Fout bij ophalen winkelwagen:", error);
        }
    }

    // Haalt ingevulde waarde op van 1 invulveld
    private getFormValue(formData: FormData, key: string): string {
        const value: FormDataEntryValue | null = formData.get(key);
        return typeof value === "string" ? value : "";
    }

    // Vraagt aan server wie is ingelogd (gebruiker ophalen)
    private async getUserId(): Promise<number> {
        const res: Response = await fetch(`${this.API_BASE}/secret`, {
            credentials: "include",
        });

        if (!res.ok) throw new Error("Geen sessie gevonden");

        const data: UserSessionData = await res.json() as UserSessionData;
        if (!data.userId || data.userId === 0) {
            throw new Error("Geen geldige gebruiker");
        }

        return data.userId;
    }
}

// Laat browser weten dat <webshop-page-checkout> gebruikt mag worden
customElements.define("webshop-page-checkout", Checkout);
