export class PasswordInputComponent extends HTMLElement {
    private _isPasswordVisible: boolean = false;
    private _input: HTMLInputElement | null = null;

    public constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    public connectedCallback(): void {
        this.render();
        this.setupEventListeners();
    }

    // Publieke methode om de huidige waarde te krijgen
    public getValue(): string {
        return this._input?.value || "";
    }

    // Publieke methode om input element te krijgen
    public getInputElement(): HTMLInputElement | null {
        return this._input;
    }

    private render(): void {
        if (!this.shadowRoot) return;

        // Link naar externe CSS
        const styleLink: HTMLLinkElement = document.createElement("link");
        styleLink.rel = "stylesheet";
        styleLink.href = "/assets/css/passwordtoggle.css";

        const container: HTMLDivElement = document.createElement("div");
        container.className = "password-container";

        // Maak de input
        const input: HTMLInputElement = document.createElement("input");
        input.className = "password-input";
        input.type = this._isPasswordVisible ? "text" : "password";
        input.name = "password";
        input.id = "password";
        input.placeholder = "Wachtwoord";
        input.required = true;

        // Als er een bestaande input waarde is, behoud deze
        if (this._input?.value) {
            input.value = this._input.value;
        }

        // Maak de toggle button
        const button: HTMLButtonElement = document.createElement("button");
        button.className = "toggle-password";
        button.type = "button";
        button.setAttribute("aria-label", this._isPasswordVisible ? "Verberg wachtwoord" : "Toon wachtwoord");
        
        // SVG voor het oog icoon - hier moeten we backticks behouden vanwege de string interpolatie
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${this._isPasswordVisible
                ? `
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                `
                : `
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                `}
            </svg>
        `;

        // Voeg alles samen
        container.appendChild(input);
        container.appendChild(button);

        // Verwijder oude content en voeg nieuwe toe
        while (this.shadowRoot.firstChild) {
            this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        }
        this.shadowRoot.appendChild(styleLink);
        this.shadowRoot.appendChild(container);

        // Update de input referentie
        this._input = input;
    }

    private setupEventListeners(): void {
        if (!this.shadowRoot) return;

        const toggleButton: HTMLButtonElement | null = this.shadowRoot.querySelector(".toggle-password");
        this._input = this.shadowRoot.querySelector(".password-input");

        if (toggleButton && this._input) {
            toggleButton.addEventListener("click", this.handleToggleClick.bind(this));
        }
    }

    private handleToggleClick(e: Event): void {
        e.preventDefault();
        e.stopPropagation();

        if (this._input) {
            const currentValue: string = this._input.value;
            const selectionStart: number | null = this._input.selectionStart;
            const selectionEnd: number | null = this._input.selectionEnd;
            
            // Toggle de zichtbaarheid
            this._isPasswordVisible = !this._isPasswordVisible;
            
            // Update direct het type van de input
            this._input.type = this._isPasswordVisible ? "text" : "password";
            
            // Update het oog icoon
            const toggleButton: HTMLButtonElement | null = this.shadowRoot?.querySelector(".toggle-password") || null;
            if (toggleButton) {
                toggleButton.setAttribute("aria-label", this._isPasswordVisible ? "Verberg wachtwoord" : "Toon wachtwoord");
                // Hier moeten we backticks behouden vanwege de string interpolatie
                toggleButton.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${this._isPasswordVisible
                        ? `
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                        `
                        : `
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        `}
                    </svg>
                `;
            }

            // Herstel de waarde en cursor positie
            this._input.value = currentValue;
            if (selectionStart !== null && selectionEnd !== null) {
                this._input.setSelectionRange(selectionStart, selectionEnd);
            }
            this._input.focus();
        }
    }
}

window.customElements.define("password-input", PasswordInputComponent);
