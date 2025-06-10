// Dit is een component die een invoerveld en knop maakt voor kortingscodes
export class DiscountCodeComponent extends HTMLElement {
    // Deze variabelen slaan de HTML elementen op die we later nodig hebben
    private discountInput: HTMLInputElement;
    private discountButton: HTMLButtonElement;
    private discountMessage: HTMLParagraphElement;

    public constructor() {
        // Roep de parent constructor aan
        super();
        // Maak een shadow DOM aan voor betere isolatie van de component
        const shadow: ShadowRoot = this.attachShadow({ mode: "open" });

        // Voeg CSS styling toe aan de component
        const style: HTMLStyleElement = document.createElement("style");
        style.textContent = `
            :host {
                display: block;
                margin: 1rem 0;
            }

            .discount-container {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .discount-input-group {
                display: flex;
                gap: 0.5rem;
            }

            .discount-input {
                flex: 1;
                padding: 0.5rem;
                border: 1px solid #333;
                border-radius: 4px;
                background-color: #1a1a1a;
                color: white;
                font-size: 0.9rem;
            }

            .discount-button {
                padding: 0.5rem 1rem;
                background-color: #703bf7;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                white-space: nowrap;
            }

            .discount-button:hover {
                background-color: #5a2fd9;
            }

            .discount-message {
                font-size: 0.9rem;
                margin: 0;
                padding: 0.5rem;
                border-radius: 4px;
            }

            .discount-message.success {
                color: #4caf50;
                background-color: rgba(76, 175, 80, 0.1);
            }

            .discount-message.error {
                color: #f44336;
                background-color: rgba(244, 67, 54, 0.1);
            }

            .discount-message:empty {
                display: none;
            }
        `;

        // Maak een container div voor alle elementen
        const container: HTMLDivElement = document.createElement("div");
        container.className = "discount-container";

        // Maak het invoerveld voor de kortingscode
        this.discountInput = document.createElement("input");
        this.discountInput.type = "text";
        this.discountInput.placeholder = "Voer kortingscode in";
        this.discountInput.className = "discount-input";

        // Maak de knop om de code te activeren
        this.discountButton = document.createElement("button");
        this.discountButton.textContent = "Toepassen";
        this.discountButton.className = "discount-button";

        // Maak een paragraaf voor foutmeldingen of succesberichten
        this.discountMessage = document.createElement("p");
        this.discountMessage.className = "discount-message";

        // Maak een groep voor het invoerveld en de knop
        const inputGroup: HTMLDivElement = document.createElement("div");
        inputGroup.className = "discount-input-group";
        inputGroup.appendChild(this.discountInput);
        inputGroup.appendChild(this.discountButton);

        // Voeg alle elementen samen
        container.appendChild(inputGroup);
        container.appendChild(this.discountMessage);
        shadow.append(style, container);

        // Als op de knop wordt geklikt, controleer de kortingscode
        this.discountButton.addEventListener("click", () => {
            void this.applyDiscount();
        });

        // Als Enter wordt ingedrukt in het invoerveld, controleer de kortingscode
        this.discountInput.addEventListener("keypress", (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                void this.applyDiscount();
            }
        });
    }

    // Deze functie controleert of de kortingscode geldig is
    private async applyDiscount(): Promise<void> {
        // Haal de ingevoerde code op en verwijder spaties
        const code: string = this.discountInput.value.trim();
        if (!code) {
            // Als er geen code is ingevoerd, toon een foutmelding
            this.showMessage("Voer een kortingscode in", "error");
            return;
        }

        try {
            // Bepaal welke API URL we moeten gebruiken (lokaal of online)
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            // Stuur een verzoek naar de server om de code te controleren
            const response: Response = await fetch(`${API_BASE}/discount/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ code }),
            });

            // Als de gebruiker niet is ingelogd, stuur door naar login pagina
            if (response.status === 401) {
                window.location.href = "/login.html";
                return;
            }

            // Als er een andere fout is, gooi een error
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            // Lees het antwoord van de server
            const responseText: string = await response.text();
            if (!responseText) {
                throw new Error("Empty response from server");
            }

            // Dit is het formaat van het antwoord dat we verwachten
            interface DiscountResponse {
                success: boolean;
                message?: string;
                discountPercentage?: number;
            }

            // Probeer het antwoord om te zetten naar JSON
            let data: DiscountResponse;
            try {
                data = JSON.parse(responseText) as DiscountResponse;
            }
            catch (parseError) {
                // Als het geen geldige JSON is, log de fout
                console.error("Failed to parse response:", responseText, parseError);
                throw new Error("Invalid server response");
            }

            // Als de code niet geldig is, toon een foutmelding
            if (!data.success) {
                throw new Error(data.message || "Ongeldige kortingscode");
            }

            // Als er geen korting is of de korting is 0%, toon een foutmelding
            if (!data.discountPercentage || data.discountPercentage <= 0) {
                throw new Error("Kortingscode is verlopen");
            }

            // Toon een succesbericht met het kortingspercentage
            this.showMessage(`Kortingscode toegepast: ${data.discountPercentage}% korting`, "success");
            this.discountInput.style.borderColor = "#4CAF50";

            // Stuur een event naar de parent component dat er een korting is toegepast
            this.dispatchEvent(new CustomEvent("discount-applied", {
                detail: {
                    discountPercentage: data.discountPercentage,
                    code: code,
                },
            }));
        }
        catch (error) {
            // Als er ergens een fout optreedt, log deze en toon een foutmelding
            console.error("Error applying discount code:", error);
            this.showMessage(error instanceof Error ? error.message : "Ongeldige kortingscode", "error");
            this.discountInput.style.borderColor = "#f44336";
        }
    }

    // Deze functie toont een bericht aan de gebruiker (success of error)
    private showMessage(message: string, type: "success" | "error"): void {
        this.discountMessage.textContent = message;
        this.discountMessage.className = `discount-message ${type}`;
    }
}

// Registreer de component zodat we deze kunnen gebruiken in HTML
customElements.define("discount-code-component", DiscountCodeComponent);
