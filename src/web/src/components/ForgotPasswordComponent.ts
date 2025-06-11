// Declare VITE_API_URL as it comes from environment variables
declare const VITE_API_URL: string;

/**
 * Interface voor de response van de forgot password API
 */
interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

/**
 * Forgot Password Component
 * Een webcomponent die een formulier implementeert voor het wijzigen van vergeten wachtwoorden
 * @element forgot-password-form
 */
export class ForgotPasswordComponent extends HTMLElement {
    private _errorMessage: HTMLElement | null = null;
    private _successMessage: HTMLElement | null = null;

    public constructor() {
        super();
    }

    public connectedCallback(): void {
        this.setupEventListeners();
        this.renderMessages();
    }

    /**
     * Rendert de error en success message containers
     * @private
     */
    private renderMessages(): void {
        // Error message container
        const errorDiv: HTMLDivElement = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.id = "error-message";
        errorDiv.style.display = "none";
        this.insertBefore(errorDiv, this.firstChild);
        this._errorMessage = errorDiv;

        // Success message container
        const successDiv: HTMLDivElement = document.createElement("div");
        successDiv.className = "success-message";
        successDiv.id = "success-message";
        successDiv.style.display = "none";
        this.insertBefore(successDiv, this._errorMessage.nextSibling);
        this._successMessage = successDiv;
    }

    /**
     * Initialiseert de event listeners voor het formulier
     * @private
     */
    private setupEventListeners(): void {
        const submitButton: HTMLButtonElement | null = this.querySelector("button[type='submit']");
        if (submitButton) {
            submitButton.addEventListener("click", this.handleSubmit.bind(this));
        }

        // Voeg ook een event listener toe aan het form element zelf
        this.addEventListener("submit", this.handleSubmit.bind(this));
    }

    /**
     * Handelt de submit event van het forgot password formulier af
     * @param e - Het form submit event
     * @private
     */
    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();

        const emailInput: HTMLInputElement = this.querySelector("input[type='email']") as HTMLInputElement;
        const newPasswordComponent: Element | null = this.querySelector("#new-password-field");
        const confirmPasswordComponent: Element | null = this.querySelector("#confirm-password-field");

        // Haal wachtwoorden op van de password components
        let newPassword: string = "";
        let confirmPassword: string = "";

        if (newPasswordComponent && typeof ((newPasswordComponent as unknown) as { getValue?: () => string }).getValue === "function") {
            newPassword = ((newPasswordComponent as unknown) as { getValue: () => string }).getValue();
        }
        else {
            const passwordInput: HTMLInputElement | null = newPasswordComponent?.shadowRoot?.querySelector("input.password-input") as HTMLInputElement | null;
            newPassword = passwordInput?.value || "";
        }

        if (confirmPasswordComponent && typeof ((confirmPasswordComponent as unknown) as { getValue?: () => string }).getValue === "function") {
            confirmPassword = ((confirmPasswordComponent as unknown) as { getValue: () => string }).getValue();
        }
        else {
            const passwordInput: HTMLInputElement | null = confirmPasswordComponent?.shadowRoot?.querySelector("input.password-input") as HTMLInputElement | null;
            confirmPassword = passwordInput?.value || "";
        }

        // Validaties
        if (!emailInput.value || !newPassword || !confirmPassword) {
            this.showError("Alle velden zijn verplicht");
            this.highlightErrorFields([emailInput, newPasswordComponent, confirmPasswordComponent]);
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showError("Wachtwoorden komen niet overeen");
            this.highlightErrorFields([newPasswordComponent, confirmPasswordComponent]);
            return;
        }

        if (newPassword.length < 4) {
            this.showError("Wachtwoord moet minimaal 4 karakters lang zijn");
            this.highlightErrorFields([newPasswordComponent, confirmPasswordComponent]);
            return;
        }

        const email: string = emailInput.value.trim();

        try {
            const response: Response = await fetch(`${VITE_API_URL}auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    newPassword,
                }),
                credentials: "include",
            });

            const data: ForgotPasswordResponse = await response.json() as ForgotPasswordResponse;

            if (!response.ok || !data.success) {
                this.showError(data.message || "Er is een fout opgetreden bij het wijzigen van het wachtwoord");
                return;
            }

            this.showSuccess(data.message || "Wachtwoord succesvol gewijzigd! Er is een bevestigingsmail verzonden.");

            // Reset het formulier na succesvolle wijziging
            setTimeout(() => {
                window.location.href = "/password-reset-success.html";
            }, 2000);
        }
        catch (error) {
            console.error("Forgot password error:", error);
            this.showError("Er is een fout opgetreden bij het verwerken van je verzoek. Probeer het later opnieuw.");
        }
    }

    /**
     * Toont een error bericht aan de gebruiker
     * @param message - Het error bericht
     * @private
     */
    private showError(message: string): void {
        if (this._errorMessage) {
            this._errorMessage.textContent = message;
            this._errorMessage.style.display = "block";
        }
        if (this._successMessage) {
            this._successMessage.style.display = "none";
        }
    }

    /**
     * Toont een success bericht aan de gebruiker
     * @param message - Het success bericht
     * @private
     */
    private showSuccess(message: string): void {
        if (this._successMessage) {
            this._successMessage.textContent = message;
            this._successMessage.style.display = "block";
        }
        if (this._errorMessage) {
            this._errorMessage.style.display = "none";
        }
    }

    /**
     * Markeert invoervelden visueel om aan te geven dat er een fout is opgetreden
     * @param elements - Array van elementen om te markeren
     * @private
     */
    private highlightErrorFields(elements: (HTMLInputElement | Element | null)[]): void {
        elements.forEach(element => {
            if (!element) return;

            if (element instanceof HTMLInputElement) {
                const originalBorder: string = element.style.border;
                element.style.border = "2px solid #ff5555";
                setTimeout(() => element.style.border = originalBorder, 3000);
            }
            else {
                // Voor password components
                const passwordInput: HTMLInputElement | null = ((element as unknown) as { shadowRoot?: ShadowRoot }).shadowRoot?.querySelector("input.password-input") as HTMLInputElement | null;
                if (passwordInput) {
                    const originalBoxShadow: string = passwordInput.style.boxShadow;
                    passwordInput.style.boxShadow = "0 0 0 2px #ff5555";
                    setTimeout(() => passwordInput.style.boxShadow = originalBoxShadow, 3000);
                }
            }
        });
    }
}

// Registreer het custom element
customElements.define("forgot-password-form", ForgotPasswordComponent);
