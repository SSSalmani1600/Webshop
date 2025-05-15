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

export class LoginComponent extends HTMLElement {
    private _rememberMeCheckbox: HTMLInputElement | null = null;
    private _errorMessage: HTMLElement | null = null;

    public constructor() {
        super();
    }

    public connectedCallback(): void {
        this.render();
        this.setupEventListeners();
    }

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

    private setupEventListeners(): void {
        this._rememberMeCheckbox = this.querySelector("input[type='checkbox']");

        const submitButton: HTMLButtonElement | HTMLInputElement | null = this.querySelector("button[type='submit']") || this.querySelector("input[type='submit']");
        if (submitButton) {
            submitButton.addEventListener("click", this.handleSubmit.bind(this));
        }
    }

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

    private async getSession(): Promise<string> {
        const storedSession: string | null = localStorage.getItem("sessionId");
        if (storedSession) return storedSession;

        const res: Response = await fetch("http://localhost:3001/session");
        const data: { sessionId: string | null } | null = await res.json() as { sessionId: string | null } | null;

        if (data && data.sessionId) return data.sessionId;

        throw new Error("Kon geen sessie krijgen");
    }

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

window.customElements.define("login-form", LoginComponent);
