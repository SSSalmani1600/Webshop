interface Address {
    id: number;
    userId: number;
    name: string;
    street: string;
    city: string;
    phone: string;
}

interface AddressResponse {
    addressId: number;
}

interface SessionResponse {
    userId: number;
}

export class Checkout extends HTMLElement {
    public constructor() {
        super();
    }

    public connectedCallback(): void {
        this.render();
        this.loadCartItems(); // 🆕 games ophalen
    }

    private render(): void {
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
                            <input type="text" name="straat_huisnummer" placeholder="Bijv. Parklaan 12A" required>

                            <label>Postcode + Plaats <span class="required">*</span></label>
                            <input type="text" name="postcode_plaats" placeholder="Bijv. 1234 AB Amsterdam" required>

                            <label>Telefoonnummer <span class="required">*</span></label>
                            <input type="text" name="telefoonnummer" placeholder="Telefoonnummer" required>

                            <button type="submit" id="place-order" class="checkout-btn">Adres opslaan</button>
                        </form>
                    </div>
                </section>

                <aside class="checkout-summary">
                    <h3>Winkelwagen</h3>
                    <!-- Hier worden de games toegevoegd via JS -->
                </aside>
            </main>
        `;

        this.initOrderSubmission();
    }

    private initOrderSubmission(): void {
        const form: HTMLFormElement | null = this.querySelector("#adresForm");
        if (!form) return;

        form.addEventListener("submit", async (event: Event) => {
            event.preventDefault();

            let userId: number;
            try {
                userId = await this.getUserId();
                console.log("Gebruiker ID:", userId);
            } catch (error) {
                console.error("Kon userId niet ophalen:", error);
                alert("Je bent niet ingelogd. Log in om je adres op te slaan.");
                return;
            }

            const formData: FormData = new FormData(form);
            const data = {
                userId,
                naam: this.getFormValue(formData, "naam").trim(),
                straatHuisnummer: this.getFormValue(formData, "straat_huisnummer").trim(),
                postcodePlaats: this.getFormValue(formData, "postcode_plaats").trim().toUpperCase(),
                telefoonnummer: this.getFormValue(formData, "telefoonnummer").trim(),
            };

            console.table(data);

            try {
                const API_BASE: string = window.location.hostname.includes("localhost")
                    ? "http://localhost:3001"
                    : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

                const res: Response = await fetch(`${API_BASE}/checkout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(data),
                });

                if (!res.ok) {
                    throw new Error("Kon adres niet opslaan");
                }

                const result: AddressResponse = await res.json();

                alert("✅ Je adres is succesvol opgeslagen!");
                window.location.href = "example.html";
            } catch (error) {
                console.error("Fout bij opslaan adres:", error);
                alert("Er is iets misgegaan bij het opslaan van je adres");
            }
        });
    }

    private async loadCartItems(): Promise<void> {
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

        try {
            const res: Response = await fetch(`${API_BASE}/cart`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Kon winkelwagen niet ophalen");

            const data = await res.json();
            const cartItems = data.cart;
            const subtotal = data.subtotal;
            const total = data.total;

            const summarySection = this.querySelector(".checkout-summary");
            if (!summarySection) return;

            const itemsHtml = cartItems.map((item: any) => `
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

            summarySection.innerHTML += `
    ${itemsHtml}
    <hr style="border: none; border-top: 1px solid #444; margin: 16px 0;">
    <div class="summary-total" style="font-size: 14px; color: #eee; line-height: 1.6;">
        <p style="margin: 4px 0;">Subtotaal: <strong>€${subtotal.toFixed(2)}</strong></p>
        <p style="margin: 4px 0;">Verzendkosten: <strong>€0,00</strong></p>
        <p style="margin: 4px 0;"><strong style="font-size: 16px;">Totaal: €${total.toFixed(2)}</strong></p>
    </div>
`;

        } catch (error) {
            console.error("❌ Fout bij ophalen winkelwagen:", error);
        }
    }

    private getFormValue(formData: FormData, key: string): string {
        const value: FormDataEntryValue | null = formData.get(key);
        return typeof value === "string" ? value : "";
    }

    private async getUserId(): Promise<number> {
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

        const res = await fetch(`${API_BASE}/secret`, {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Niet ingelogd – user cookie ontbreekt");
        }

        const data = await res.json();
        if (!data.userId || data.userId === 0) {
            throw new Error("Niet ingelogd – ongeldig userId");
        }

        return data.userId;
    }
}

customElements.define("webshop-page-checkout", Checkout);
