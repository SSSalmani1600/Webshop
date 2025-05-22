// Haalt component op die winkelwagen laat zien
import { CartSummaryComponent } from "../components/CheckoutproductComponent";

// Maakt nieuwe custom HTML tag aan voor checkout pagina
export class Checkout extends HTMLElement {
    // Deze functie draait automatisch als pagina geladen wordt
    public connectedCallback(): void {
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

        // Start functie die winkelwagen ophaalt en laat zien
        this.initCartSummary();

        // Start functie die kijkt of formulier is ingevuld en stuurt naar backend
        this.initOrderSubmission();
    }

    // Deze functie maakt en laat samenvatting van winkelwagen zien
    private initCartSummary(): void {
        const summary: CartSummaryComponent = new CartSummaryComponent(".checkout-summary");
        void summary.render();
    }

    // Deze functie zorgt dat als je op 'adres opslaan' klikt
    // het formulier wordt verwerkt en verstuurd naar backend
    private initOrderSubmission(): void {
        // Pakt het formulier uit de pagina
        const form: HTMLFormElement = this.querySelector("#adresForm") as HTMLFormElement;
        // if (!form) return;

        // Als je op 'adres opslaan' klikt gebeurt dit
        form.addEventListener("submit", async (event: Event) => {
            event.preventDefault(); // voorkomt dat pagina opnieuw laadt

            // Tijdelijk test userId gebruiken
            const userId: number = 1;

            // Haalt alle ingevulde data uit het formulier
            const formData: FormData = new FormData(form);
            const data: { userId: number; naam: string; straatHuisnummer: string; postcodePlaats: string; telefoonnummer: string } = {
                userId,
                naam: (formData.get("naam")?.toString() || "").toString().trim(),
                straatHuisnummer: (formData.get("straat_huisnummer")?.toString() || "").toString().trim(),
                postcodePlaats: (formData.get("postcode_plaats")?.toString() || "").toString().trim(),
                telefoonnummer: (formData.get("telefoonnummer")?.toString() || "").toString().trim(),
            };

            // Laat zien wat we sturen naar backend
            console.log("Data naar backend:");
            console.table(data);

            try {
                // Verstuur data naar backend via fetch POST request
                const res: Response = await fetch("http://localhost:3001/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(data),
                });

                // Als backend geen succes teruggeeft laat fout zien
                if (!res.ok) throw new Error("Kon adres niet opslaan");

                // Backend geeft adresId terug dit laten we zien aan gebruiker
                const result: { addressId: string } = await res.json() as { addressId: string };
                alert("Adres opgeslagen Adres ID " + result.addressId);
            }
            catch (err) {
                // Als iets fout gaat in fetch laat foutmelding zien
                console.error("Fout bij opslaan adres", err);
                alert("Er is iets misgegaan bij het opslaan van je adres");
            }
        });
    }
}

// Registreert deze class als custom element
customElements.define("webshop-page-checkout", Checkout);
