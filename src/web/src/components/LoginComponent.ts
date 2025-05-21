/**
 * Interface die de structuur van het response van de login API endpoint beschrijft
 */
interface LoginResponse {
    success: boolean;
    message: string;
    user?: {
        id: number;
        username: string;
        email: string;
    };
    sessionId?: string;
}

/**
 * Login Component
 * Een webcomponent die een loginformulier implementeert met "onthoud mij" functionaliteit
 * @element login-form
 */
export class LoginComponent extends HTMLElement {
    private _rememberMeCheckbox: HTMLInputElement | null = null;
    private _errorMessage: HTMLElement | null = null;

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
     * Maakt de error message container aan en voegt deze toe aan het formulier
     * @private
     */
    private render(): void {
        const errorDiv: HTMLDivElement = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.id = "error-message";
        errorDiv.style.color = "red";
        errorDiv.style.marginBottom = "15px";
        errorDiv.style.fontSize = "14px";
        errorDiv.style.display = "none";

        this.insertBefore(errorDiv, this.firstChild);
        this._errorMessage = errorDiv;
    }

    /**
     * Initialiseert de event listeners voor het formulier, inclusief de submit button
     * en de remember me checkbox
     * @private
     */
    private setupEventListeners(): void {
        this._rememberMeCheckbox = this.querySelector("input[type='checkbox']");

        const submitButton: HTMLButtonElement | HTMLInputElement | null = this.querySelector("button[type='submit']") || this.querySelector("input[type='submit']");
        if (submitButton) {
            submitButton.addEventListener("click", this.handleSubmit.bind(this));
        }
    }

    /**
     * Handelt de submit event van het login formulier af
     * Valideert de input, stuurt de login request naar de server en handelt de response af
     * @param e - Het form submit event
     * @private
     */
    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();

        const emailInput: HTMLInputElement = (this.querySelector("input[name='username']") || this.querySelector("input[type='email']")) as HTMLInputElement;
        const passwordComponent: Element | null = this.querySelector("password-input");

        let password: string = "";
        if (passwordComponent && typeof ((passwordComponent as unknown) as { getValue?: () => string }).getValue === "function") {
            password = ((passwordComponent as unknown) as { getValue: () => string }).getValue();
        }
        else {
            const passwordInput: HTMLInputElement | null = passwordComponent?.shadowRoot?.querySelector("input.password-input") as HTMLInputElement | null;
            password = passwordInput?.value || "";
        }

        if (!emailInput.value || !password) {
            this.showError("Email/gebruikersnaam en wachtwoord velden zijn vereist");
            this.highlightErrorFields(emailInput, passwordComponent);
            return;
        }

        const loginIdentifier: string = emailInput.value.trim();
        const rememberMe: boolean = this._rememberMeCheckbox?.checked || false;

        try {
            const sessionId: string = await this.getSession();
            const response: Response = await fetch("http://localhost:3001/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-session": sessionId,
                },
                body: JSON.stringify({
                    loginIdentifier,
                    password,
                    rememberMe,
                }),
                credentials: "include",
            });

            const data: LoginResponse = await response.json() as LoginResponse;

            if (!response.ok || !data.success) {
                this.showError(data.message || "Inloggen mislukt. Controleer je gegevens en probeer opnieuw.");
                this.highlightErrorFields(emailInput, passwordComponent);
                return;
            }

            if (rememberMe && data.sessionId) {
                localStorage.setItem("sessionId", data.sessionId);
            }

            window.location.href = "/product.html";
        }
        catch (error) {
            console.error("Login error:", error);
            this.showError("Er is een fout opgetreden bij het inloggen. Probeer het later opnieuw.");
            this.highlightErrorFields(emailInput, passwordComponent);
        }
    }

    /**
     * Toont een foutmelding in de error message container
     * @param message - De foutmelding die getoond moet worden
     * @private
     */
    private showError(message: string): void {
        if (this._errorMessage) {
            this._errorMessage.style.display = "none";
            setTimeout(() => {
                if (this._errorMessage) {
                    this._errorMessage.textContent = message;
                    this._errorMessage.style.display = "block";
                }
            }, 100);
        }
    }

    /**
     * Haalt een sessie op, eerst uit localStorage (voor remember me functionaliteit)
     * of anders door een nieuwe sessie aan te vragen bij de server
     * @returns Een Promise die resolvet naar een sessie ID string
     * @private
     */
    private async getSession(): Promise<string> {
        const storedSession: string | null = localStorage.getItem("sessionId");
        if (storedSession) return storedSession;

        const res: Response = await fetch("http://localhost:3001/session");
        const data: { sessionId: string | null } | null = await res.json() as { sessionId: string | null } | null;

        if (data && data.sessionId) return data.sessionId;

        throw new Error("Kon geen sessie krijgen");
    }

    /**
     * Markeert invoervelden visueel om aan te geven dat er een fout is opgetreden
     * @param emailInput - Het email/username input element
     * @param passwordComponent - Het password component element
     * @private
     */
    private highlightErrorFields(emailInput: HTMLInputElement | null, passwordComponent: Element | null): void {
        if (emailInput) {
            const originalBorder: string = emailInput.style.border;
            emailInput.style.border = "2px solid #ff5555";
            setTimeout(() => emailInput.style.border = originalBorder, 1000);
        }

        if (passwordComponent) {
            const passwordInput: HTMLInputElement | null = ((passwordComponent as unknown) as { shadowRoot?: ShadowRoot }).shadowRoot?.querySelector("input.password-input") as HTMLInputElement | null;
            if (passwordInput) {
                const originalBorder: string = passwordInput.style.boxShadow;
                passwordInput.style.boxShadow = "0 0 0 2px #ff5555";
                setTimeout(() => passwordInput.style.boxShadow = originalBorder, 1000);
            }
        }
    }
}

// Registreer de component als HTML element
window.customElements.define("login-form", LoginComponent);
