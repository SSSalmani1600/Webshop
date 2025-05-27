import { addProduct, getProductsWithPrices, hideProduct } from "../pages/admin.js";
import { Game } from "@api/types/Game";
import { NewProduct } from "@api/types/NewProduct.js";

type GameWithPrice = Game & { price?: number | null; hidden?: boolean };

/**
 * Web Component for managing products in the admin interface.
 */
export class AdminComponent extends HTMLElement {
    /**
     * Lifecycle hook called when the component is added to the DOM.
     */
    public async connectedCallback(): Promise<void> {
        try {
            const products: GameWithPrice[] = await getProductsWithPrices();
            this.renderProducts(products);
        }
        catch {
            this.renderError("Er ging iets mis bij het ophalen van producten.");
        }
    }

    /**
     * Renders the product list along with the modal to add new products.
     * @param products - Array of products to render.
     */
    public renderProducts(products: GameWithPrice[]): void {
        if (products.length === 0) {
            this.innerHTML = "<p>Er zijn geen producten beschikbaar.</p>";
            return;
        }

        const listHtml: string = products.map(product => {
            const imageUrl: string =
                typeof product.images === "string" && product.images.length > 0
                    ? product.images.split(",")[0].trim()
                    : "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

            const price: string = product.price !== null && product.price !== undefined
                ? `€ ${product.price.toFixed(2)}`
                : "Prijs onbekend";

            const eyeIcon: string = product.hidden
                ? "<i class=\"fa fa-eye-slash\" aria-hidden=\"true\"></i>"
                : "<i class=\"fa fa-eye\" aria-hidden=\"true\"></i>";

            return `
                <div class="product-card">
                    <img class="product-image" src="${imageUrl}" alt="${product.title}" />
                    <strong>${product.title}</strong>
                    <div class="price">${price}</div>
                    <div class="button-row">
                        <button class="action-button edit">Aanpassen</button>
                        <button class="action-button toggle-visibility" data-id="${product.id}" data-hidden="${product.hidden}">
                            ${eyeIcon}
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        this.innerHTML = `
            <div class="product-header">
                <h2>Alle producten</h2>
                <button class="create-button">Product aanmaken</button>
            </div>
            <section class="product-list">${listHtml}</section>

            <div class="modal-overlay hidden">
                <div class="modal">
                    <h3>Nieuw product aanmaken</h3>
                    <form id="product-form">
                        <input type="text" placeholder="Titel" name="title" required />
                        <input type="text" placeholder="Afbeelding URL" name="image" />
                        <textarea placeholder="Beschrijving" name="description"></textarea>
                        <div class="form-actions">
                            <button type="submit" class="action-button">Opslaan</button>
                            <button type="button" class="action-button delete close-button">Annuleren</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.initModalEvents();
        this.initFormSubmit();
        this.initVisibilityToggles();
    }

    /**
     * Initializes open/close events for the modal dialog.
     */
    private initModalEvents(): void {
        this.querySelector(".create-button")?.addEventListener("click", () => {
            this.querySelector(".modal-overlay")?.classList.remove("hidden");
        });

        this.querySelector(".close-button")?.addEventListener("click", () => {
            this.querySelector(".modal-overlay")?.classList.add("hidden");
        });
    }

    /**
     * Handles form submission to create a new product.
     */
    private initFormSubmit(): void {
        const form: HTMLFormElement = this.querySelector("#product-form") as HTMLFormElement;
        form.addEventListener("submit", async e => {
            e.preventDefault();

            const formData: FormData = new FormData(form);
            const title: string = formData.get("title")?.toString().trim() || "";
            const image: string = formData.get("image")?.toString().trim() || "";
            const descriptionHtml: string = formData.get("description")?.toString().trim() || "";

            if (!title) {
                alert("Titel is verplicht.");
                return;
            }

            const newProduct: NewProduct = {
                title,
                descriptionHtml,
                images: image || null,
            };

            try {
                await addProduct(newProduct);
                alert("Product succesvol toegevoegd.");
                void this.connectedCallback(); // Reload list
            }
            catch {
                alert("Fout bij toevoegen van product.");
            }

            this.querySelector(".modal-overlay")?.classList.add("hidden");
        });
    }

    /**
     * Initializes toggle visibility buttons to hide/show products.
     */
    private initVisibilityToggles(): void {
        this.querySelectorAll(".toggle-visibility").forEach(button => {
            button.addEventListener("click", async () => {
                const btn: HTMLElement = button as HTMLElement;
                const id: number = parseInt(btn.dataset.id ?? "0", 10);
                const currentHidden: boolean = btn.dataset.hidden === "true";

                if (!id) return;

                try {
                    await hideProduct(id, !currentHidden);
                    btn.dataset.hidden = String(!currentHidden);
                    btn.innerHTML = !currentHidden
                        ? "<i class=\"fa fa-eye-slash\" aria-hidden=\"true\"></i>"
                        : "<i class=\"fa fa-eye\" aria-hidden=\"true\"></i>";
                }
                catch {
                    alert("Er ging iets mis bij het wijzigen van de zichtbaarheid.");
                }
            });
        });
    }

    /**
     * Displays an error message inside the component.
     * @param message - The error message to display.
     */
    public renderError(message: string): void {
        this.innerHTML = `<p style="color:red;">${message}</p>`;
    }
}

customElements.define("admin-component", AdminComponent);
