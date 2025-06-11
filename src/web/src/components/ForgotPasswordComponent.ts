/**
 * Interface die de structuur van het response van de forgot password API endpoint beschrijft
 */
interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

// Declare VITE_API_URL as it comes from environment variables
declare const VITE_API_URL: string;

/**
 * Forgot Password Component
 * Een webcomponent die een wachtwoord-vergeten formulier implementeert
 * @element forgot-password-form
 */
export class ForgotPasswordComponent extends HTMLElement {
    private _errorMessage: HTMLElement | null = null;
    private _successMessage: HTMLElement | null = null;

    public constructor() {
        super();
    }

    /**
     * Wordt aangeroepen wanneer het element aan de DOM wordt toegevoegd
     * Initialiseert de component door de render en setupEventListeners methoden aan te roepen
     */
    public connectedCallback(): void {
        this.render();
        this.setupEventListeners();
    }

    /**
     * Maakt de error en success message containers aan en voegt deze toe aan het formulier
     * @private
     */
    private render(): void {
        // Error message container
        const errorDiv: HTMLDivElement = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.id = "forgot-password-error-message";
        errorDiv.style.color = "#dc3545";
        errorDiv.style.marginBottom = "15px";
        errorDiv.style.fontSize = "14px";
        errorDiv.style.display = "none";
        errorDiv.style.padding = "10px";
        errorDiv.style.border = "1px solid #dc3545";
        errorDiv.style.borderRadius = "4px";
        errorDiv.style.backgroundColor = "#f8d7da";

        // Success message container
        const successDiv: HTMLDivElement = document.createElement("div");
        successDiv.className = "success-message";
        successDiv.id = "forgot-password-success-message";
        successDiv.style.color = "#155724";
        successDiv.style.marginBottom = "15px";
        successDiv.style.fontSize = "14px";
        successDiv.style.display = "none";
        successDiv.style.padding = "10px";
        successDiv.style.border = "1px solid #28a745";
        successDiv.style.borderRadius = "4px";
        successDiv.style.backgroundColor = "#d4edda";

        this.insertBefore(errorDiv, this.firstChild);
        this.insertBefore(successDiv, this.firstChild);
        this._errorMessage = errorDiv;
        this._successMessage = successDiv;
    }

    /**
     * Initialiseert de event listeners voor het formulier
     * @private
     */
    private setupEventListeners(): void {
        const submitButton: HTMLButtonElement | HTMLInputElement | null =
            this.querySelector("button[type='submit']") || this.querySelector("input[type='submit']");

        if (submitButton) {
            submitButton.addEventListener("click", this.handleSubmit.bind(this));
        }

        // Ook luister naar form submit event
        const form: HTMLFormElement | null = this.querySelector("form");
        if (form) {
            form.addEventListener("submit", this.handleSubmit.bind(this));
        }
    }

    /**
     * Handelt de submit event van het forgot password formulier af
     * Valideert de input, stuurt de request naar de server en handelt de response af
     * @param e - Het form submit event
     * @private
     */
    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();

        this.hideMessages();

        const emailInput: HTMLInputElement | null = this.querySelector("input[type='email']") ||
          this.querySelector("input[name='email']");

        if (!emailInput) {
            this.showError("Email invoerveld niet gevonden");
            return;
        }

        const email: string = emailInput.value.trim();

        if (!email) {
            this.showError("Email adres is verplicht");
            this.highlightErrorField(emailInput);
            return;
        }

        // Basic email validation
        const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError("Voer een geldig email adres in");
            this.highlightErrorField(emailInput);
            return;
        }

        // Disable submit button during request
        const submitButton: HTMLButtonElement | HTMLInputElement | null =
            this.querySelector("button[type='submit']") || this.querySelector("input[type='submit']");

        if (submitButton) {
            submitButton.disabled = true;
            const originalText: string = submitButton.textContent || submitButton.value;
            if (submitButton.textContent !== null) {
                submitButton.textContent = "Bezig met verzenden...";
            }
            else {
                (submitButton as HTMLInputElement).value = "Bezig met verzenden...";
            }

            // Restore button after 3 seconds regardless of result
            setTimeout(() => {
                submitButton.disabled = false;
                if (submitButton.textContent !== null) {
                    submitButton.textContent = originalText;
                }
                else {
                    (submitButton as HTMLInputElement).value = originalText;
                }
            }, 3000);
        }

        try {
            const response: Response = await fetch(`${VITE_API_URL}auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data: ForgotPasswordResponse = await response.json() as ForgotPasswordResponse;

            if (data.success) {
                this.showSuccess(data.message);
                emailInput.value = ""; // Clear the form
            }
            else {
                this.showError(data.message);
                this.highlightErrorField(emailInput);
            }
        }
        catch (error) {
            console.error("Forgot password error:", error);
            this.showError("Er is een fout opgetreden. Probeer het later opnieuw.");
            this.highlightErrorField(emailInput);
        }
    }

    /**
     * Toont een foutmelding
     * @param message - De foutmelding die getoond moet worden
     * @private
     */
    private showError(message: string): void {
        this.hideMessages();
        if (this._errorMessage) {
            this._errorMessage.textContent = message;
            this._errorMessage.style.display = "block";
        }
    }

    /**
     * Toont een success melding
     * @param message - De success melding die getoond moet worden
     * @private
     */
    private showSuccess(message: string): void {
        this.hideMessages();
        if (this._successMessage) {
            this._successMessage.textContent = message;
            this._successMessage.style.display = "block";
        }
    }

    /**
     * Verbergt alle message containers
     * @private
     */
    private hideMessages(): void {
        if (this._errorMessage) {
            this._errorMessage.style.display = "none";
        }
        if (this._successMessage) {
            this._successMessage.style.display = "none";
        }
    }

    /**
     * Markeert een invoerveld visueel om aan te geven dat er een fout is opgetreden
     * @param input - Het input element om te markeren
     * @private
     */
    private highlightErrorField(input: HTMLInputElement): void {
        const originalBorder: string = input.style.border;
        input.style.border = "2px solid #dc3545";
        setTimeout(() => {
            input.style.border = originalBorder;
        }, 3000);
    }
}

// Registreer de component als HTML element
window.customElements.define("forgot-password-form", ForgotPasswordComponent);
