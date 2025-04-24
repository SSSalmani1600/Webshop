export class PasswordInputComponent extends HTMLElement {
    private _input: HTMLInputElement | null = null;
    private _toggleButton: HTMLButtonElement | null = null;

    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.render();
        this.setupEventListeners();
    }

    private render(): void {
        if (this.shadowRoot) {
            // Voeg link naar externe CSS toe
            const styleLink: HTMLLinkElement = document.createElement("link");
            styleLink.rel = "stylesheet";
            styleLink.href = "/assets/css/passwordtoggle.css";
            this.shadowRoot.appendChild(styleLink);

            // Maak container voor wachtwoord input en toggle-knop
            const container: HTMLDivElement = document.createElement("div");
            container.className = "password-container";

            // Maak password input element
            const input: HTMLInputElement = document.createElement("input");
            input.type = "password";
            input.className = "password-input";
            input.name = "password";
            input.placeholder = "Wachtwoord";
            input.required = true;

            // Maak toggle button
            const button: HTMLButtonElement = document.createElement("button");
            button.type = "button";
            button.className = "password-toggle";
            button.innerHTML = "👁️";
            button.title = "Wachtwoord tonen/verbergen";

            // Voeg elementen toe aan container
            container.appendChild(input);
            container.appendChild(button);

            // Voeg container toe aan shadow DOM
            this.shadowRoot.appendChild(container);
        }
    }

    private setupEventListeners(): void {
        if (!this.shadowRoot) return;

        this._input = this.shadowRoot.querySelector("input.password-input");
        this._toggleButton = this.shadowRoot.querySelector("button.password-toggle");

        if (this._toggleButton && this._input) {
            this._toggleButton.addEventListener("click", this.togglePasswordVisibility.bind(this));
        }
    }

    private togglePasswordVisibility(): void {
        if (!this._input) return;

        if (this._input.type === "password") {
            this._input.type = "text";
            if (this._toggleButton) {
                this._toggleButton.innerHTML = "🔒";
                this._toggleButton.title = "Wachtwoord verbergen";
            }
        }
        else {
            this._input.type = "password";
            if (this._toggleButton) {
                this._toggleButton.innerHTML = "👁️";
                this._toggleButton.title = "Wachtwoord tonen";
            }
        }

        // Focus teruggeven aan input met behoud van cursor positie
        this._input.focus();
        const currentValue: string = this._input.value;
        const selectionStart: number | null = this._input.selectionStart;
        const selectionEnd: number | null = this._input.selectionEnd;

        // Value opnieuw zetten om eventuele browserbugs te voorkomen
        this._input.value = currentValue;

        // Cursor positie herstellen
        if (selectionStart !== null && selectionEnd !== null) {
            this._input.setSelectionRange(selectionStart, selectionEnd);
        }
    }

    // Publieke methode om de huidige waarde van het wachtwoord op te halen
    public getValue(): string {
        return this._input?.value || "";
    }

    // Getter voor de input element
    public getInputElement(): HTMLInputElement | null {
        return this._input;
    }
}

window.customElements.define("password-input", PasswordInputComponent);
