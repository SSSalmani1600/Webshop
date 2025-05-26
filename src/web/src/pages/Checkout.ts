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

// Maakt nieuwe custom HTML tag aan voor checkout pagina
export class Checkout extends HTMLElement {
    public constructor() {
        super();
    }

    public connectedCallback(): void {
        this.render();
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

        this.initOrderSubmission();
    }

    private initOrderSubmission(): void {
        const form: HTMLFormElement | null = this.querySelector("#adresForm");
        if (!form) {
            return;
        }

        form.addEventListener("submit", async (event: Event) => {
            event.preventDefault();

            const userId: number = await this.getUserId();
            console.log("Gebruiker ID:", userId);

            if (!userId || isNaN(userId)) {
                alert("Je bent niet ingelogd. Log in om je adres op te slaan.");
                return;
            }

            const formData: FormData = new FormData(form);
            const data = {
                userId,
                naam: this.getFormValue(formData, "naam"),
                straatHuisnummer: this.getFormValue(formData, "straat_huisnummer"),
                postcodePlaats: this.getFormValue(formData, "postcode_plaats"),
                telefoonnummer: this.getFormValue(formData, "telefoonnummer"),
            };

            console.log("Data naar backend:");
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

                const result: AddressResponse = await res.json() as AddressResponse;
                window.location.href = `/order-confirmation.html?addressId=${result.addressId}`;
            } catch (error: unknown) {
                console.error("Fout bij opslaan adres:", error);
                alert("Er is iets misgegaan bij het opslaan van je adres");
            }
        });
    }

    private getFormValue(formData: FormData, key: string): string {
        const value: FormDataEntryValue | null = formData.get(key);
        return typeof value === "string" ? value : "";
    }

    private async getUserId(): Promise<number> {
        const API_BASE: string = window.location.hostname.includes("localhost")
            ? "http://localhost:3001"
            : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

        const res: Response = await fetch(`${API_BASE}/session`, {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Not logged in");
        }

        const data: SessionResponse = await res.json() as SessionResponse;
        return data.userId;
    }
}

customElements.define("webshop-page-checkout", Checkout);
