export class RegisterForm extends HTMLElement {
    private _errorMessage: HTMLElement | null = null;

    public constructor() {
        super();
    }

    public connectedCallback(): void {
        this.setupEventListeners();
        this.renderErrorMessageContainer();
    }

    private renderErrorMessageContainer(): void {
        const form: Element | null = this.querySelector("#register-form");
        if (!form) return;

        const errorDiv: HTMLDivElement = document.createElement("div");
        errorDiv.className = "error-message";
        errorDiv.id = "error-message";
        errorDiv.style.color = "red";
        errorDiv.style.marginBottom = "15px";
        errorDiv.style.fontSize = "14px";
        errorDiv.style.display = "none";

        form.insertBefore(errorDiv, form.firstChild);
        this._errorMessage = errorDiv;
    }

    private setupEventListeners(): void {
        const form: HTMLFormElement | null = this.querySelector<HTMLFormElement>("#register-form");
        if (form) {
            form.addEventListener("submit", event => this.handleSubmit(event));
        }
    }

    private async handleSubmit(event: SubmitEvent): Promise<void> {
        event.preventDefault();

        const form: HTMLFormElement = event.target as HTMLFormElement;
        const formData: FormData = new FormData(form);

        const user: {
            username: FormDataEntryValue | null;
            email: FormDataEntryValue | null;
            password: FormDataEntryValue | null;
        } = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password"),
        };

        if (!user.username || !user.email || !user.password) {
            this.showError("Vul alle velden in.");
            return;
        }

        try {
            const response: Response = await fetch("http://localhost:3001/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                throw new Error("Registratie mislukt");
            }

            alert("Account succesvol aangemaakt!");
            form.reset();
            this.hideError();
        }
        catch (error) {
            console.error("Fout bij registratie:", error);
            this.showError("Er is iets misgegaan bij het registreren.");
        }
    }

    private showError(message: string): void {
        if (this._errorMessage) {
            this._errorMessage.textContent = message;
            this._errorMessage.style.display = "block";
        }
    }

    private hideError(): void {
        if (this._errorMessage) {
            this._errorMessage.style.display = "none";
        }
    }
}

customElements.define("register-form", RegisterForm);
