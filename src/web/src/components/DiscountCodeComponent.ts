// Custom HTML component die een invoerveld en knop toont voor kortingscodes en communiceert met de server
export class DiscountCodeComponent extends HTMLElement {
    // Input, button en message elements die we gebruiken om de kortingscode UI te maken en bij te werken
    private discountInput: HTMLInputElement;
    private discountButton: HTMLButtonElement;
    private discountMessage: HTMLParagraphElement;

    public constructor() {
        super();
        const shadow: ShadowRoot = this.attachShadow({ mode: "open" });

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

        const container: HTMLDivElement = document.createElement("div");
        container.className = "discount-container";

        this.discountInput = document.createElement("input");
        this.discountInput.type = "text";
        this.discountInput.placeholder = "Voer kortingscode in";
        this.discountInput.className = "discount-input";

        this.discountButton = document.createElement("button");
        this.discountButton.textContent = "Toepassen";
        this.discountButton.className = "discount-button";

        this.discountMessage = document.createElement("p");
        this.discountMessage.className = "discount-message";

        const inputGroup: HTMLDivElement = document.createElement("div");
        inputGroup.className = "discount-input-group";
        inputGroup.appendChild(this.discountInput);
        inputGroup.appendChild(this.discountButton);

        container.appendChild(inputGroup);
        container.appendChild(this.discountMessage);

        shadow.append(style, container);

        this.discountButton.addEventListener("click", () => {
            void this.applyDiscount();
        });

        this.discountInput.addEventListener("keypress", (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                void this.applyDiscount();
            }
        });
    }

    // Verstuurt de ingevoerde kortingscode naar de server via POST request en verwerkt de response (success/error)
    private async applyDiscount(): Promise<void> {
        const code: string = this.discountInput.value.trim();
        if (!code) {
            this.showMessage("Voer een kortingscode in", "error");
            return;
        }

        try {
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            const response: Response = await fetch(`${API_BASE}/discount/apply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ code }),
            });

            if (response.status === 401) {
                window.location.href = "/login.html";
                return;
            }

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const responseText: string = await response.text();
            if (!responseText) {
                throw new Error("Empty response from server");
            }

            interface DiscountResponse {
                success: boolean;
                message?: string;
                discountPercentage?: number;
            }

            let data: DiscountResponse;
            try {
                data = JSON.parse(responseText) as DiscountResponse;
            }
            catch (parseError) {
                console.error("Failed to parse response:", responseText, parseError);
                throw new Error("Invalid server response");
            }

            if (!data.success) {
                throw new Error(data.message || "Ongeldige kortingscode");
            }

            if (!data.discountPercentage || data.discountPercentage <= 0) {
                throw new Error("Kortingscode is verlopen");
            }

            this.showMessage(`Kortingscode toegepast: ${data.discountPercentage}% korting`, "success");
            this.discountInput.style.borderColor = "#4CAF50";

            this.dispatchEvent(new CustomEvent("discount-applied", {
                detail: {
                    discountPercentage: data.discountPercentage,
                    code: code,
                },
            }));
        }
        catch (error) {
            console.error("Error applying discount code:", error);
            this.showMessage(error instanceof Error ? error.message : "Ongeldige kortingscode", "error");
            this.discountInput.style.borderColor = "#f44336";
        }
    }

    // Toont een success of error bericht aan de gebruiker en past de juiste styling toe (groen/rood)
    private showMessage(message: string, type: "success" | "error"): void {
        this.discountMessage.textContent = message;
        this.discountMessage.className = `discount-message ${type}`;
    }
}

customElements.define("discount-code-component", DiscountCodeComponent);
