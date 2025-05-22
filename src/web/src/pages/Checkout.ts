// Haalt component op die winkelwagen laat zien
// (CartSummaryComponent is niet gebruikt, dus import verwijderd)

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

    // Deze functie draait automatisch als pagina geladen wordt
    public connectedCallback(): void {
        this.render();
    }

    private render(): void {
        // Zet HTML op het scherm voor afrekenpagina
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

        // Start functie die kijkt of formulier is ingevuld en stuurt naar backend
        this.initOrderSubmission();
    }

    // Deze functie zorgt dat als je op 'adres opslaan' klikt
    // het formulier wordt verwerkt en verstuurd naar backend
    private initOrderSubmission(): void {
        // Pakt het formulier uit de pagina
        const form: HTMLFormElement | null = this.querySelector("#adresForm");
        if (!form) {
            return;
        }

        // Als je op 'adres opslaan' klikt gebeurt dit
        form.addEventListener("submit", async (event: Event) => {
            event.preventDefault(); // voorkomt dat pagina opnieuw laadt

            // Tijdelijk test userId gebruiken
            const userId: number = await this.getUserId();

            // Haalt alle ingevulde data uit het formulier
            const formData: FormData = new FormData(form);
            const data: Address = {
                id: 0,
                userId,
                name: this.getFormValue(formData, "naam"),
                street: this.getFormValue(formData, "straat_huisnummer"),
                city: this.getFormValue(formData, "postcode_plaats"),
                phone: this.getFormValue(formData, "telefoonnummer"),
            };

            // Laat zien wat we sturen naar backend
            console.log("Data naar backend:");
            console.table(data);

            try {
                // Verstuur data naar backend via fetch POST request
                const res: Response = await fetch("http://localhost:3001/addresses", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(data),
                });

                // Als backend geen succes teruggeeft laat fout zien
                if (!res.ok) {
                    throw new Error("Kon adres niet opslaan");
                }

                // Backend geeft adresId terug dit laten we zien aan gebruiker
                const result: AddressResponse = await res.json() as AddressResponse;
                window.location.href = `/order-confirmation.html?addressId=${result.addressId}`;
            }
            catch (error: unknown) {
                // Als iets fout gaat in fetch laat foutmelding zien
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
        const res: Response = await fetch("http://localhost:3001/session", {
            credentials: "include",
        });

        if (!res.ok) {
            throw new Error("Not logged in");
        }

        const data: SessionResponse = await res.json() as SessionResponse;
        return data.userId;
    }
}

// Registreert deze class als custom element
customElements.define("webshop-page-checkout", Checkout);
