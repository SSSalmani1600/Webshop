// Dit zegt hoe één item in de winkelwagen eruitziet
interface CartItem {
    id: number;
    game_id: number;
    quantity: number;
    price: string;
    title: string;
    thumbnail: string;
}

// Deze class laat samenvatting van winkelwagen zien op de afrekenpagina
export class CartSummaryComponent {
    private container: HTMLElement;

    // Bij het aanmaken geef je een stukje HTML op waar alles in komt
    public constructor(containerSelector: string) {
        const container: Element | null = document.querySelector(containerSelector);
        if (!container) throw new Error(`Container ${containerSelector} niet gevonden`);
        this.container = container as HTMLElement;
    }

    // Deze functie haalt data op van backend en vult winkelwagenblok
    public async render(): Promise<void> {
        const cartItems: CartItem[] = await this.fetchCartItems(); // haalt winkelwagen items op
        this.container.innerHTML = ""; // maakt eerst alles leeg

        // Als winkelwagen leeg is laat tekst zien en stopt
        if (cartItems.length === 0) {
            this.container.innerHTML = "<p>Je winkelwagen is leeg.</p>";
            return;
        }

        let totaal: number = 0; // begint met totaalprijs op nul

        // Voor elk item in winkelwagen
        cartItems.forEach((item: CartItem) => {
            const prijs: number = parseFloat(item.price); // zet prijs om naar getal
            const totaalItem: number = prijs * item.quantity; // prijs keer aantal
            totaal += totaalItem; // telt op bij totaalprijs

            // Maakt blokje aan met info van dit product
            const div: HTMLDivElement = document.createElement("div");
            div.className = "summary-item";
            div.innerHTML = `
                <div>
                    <img src="${item.thumbnail}" alt="${item.title}" width="50" height="50" />
                    <p>${item.title}</p>
                    <p>€${totaalItem.toFixed(2)}</p>
                </div>
            `;
            // Zet dat blokje in de container
            this.container.appendChild(div);
        });

        // Lijn tussen producten en totaal
        const hr: HTMLDivElement = document.createElement("hr");
        this.container.appendChild(hr);

        // Maakt blokje met totaalprijzen
        const totaalDiv: HTMLDivElement = document.createElement("div");
        totaalDiv.className = "summary-total";
        totaalDiv.innerHTML = `
            <p>Subtotaal: €${totaal.toFixed(2)}</p>
            <p>Verzendkosten: €0,00</p>
            <p><strong>Totaal: €${totaal.toFixed(2)}</strong></p>
        `;
        this.container.appendChild(totaalDiv);

        // Maakt knop om door te gaan naar afrekenen
        const button: HTMLButtonElement = document.createElement("button");
        button.className = "checkout-btn";
        button.textContent = "Verder naar afrekenen";
        button.addEventListener("click", () => {
            window.location.href = "example.html";
        });
        this.container.appendChild(button);
    }

    // Haalt winkelwagen op van backend
    private async fetchCartItems(): Promise<CartItem[]> {
        const res: Response = await fetch("http://localhost:3001/cart", {
            credentials: "include",
        });
        if (!res.ok) throw new Error("Kan cart items niet ophalen");
        const data: { cart: CartItem[] } = await res.json() as { cart: CartItem[] };
        return data.cart;
    }
}
