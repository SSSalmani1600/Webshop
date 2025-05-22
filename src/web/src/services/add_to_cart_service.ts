/**
 * Interface voor de response van toevoegen aan winkelmandje
 */
interface AddToCartResponse {
    /** Geeft aan of de actie succesvol was */
    success: boolean;
    /** Bericht van de server */
    message?: string;
}

/**
 * Service die verantwoordelijk is voor het toevoegen aan het winkelmandje
 */
export class AddToCartService {
    /**
     * Voeg een game toe aan het winkelmandje
     *
     * @param gameId - Het ID van de game die toegevoegd moet worden
     * @param quantity - Het aantal (standaard: 1)
     * @param price - De prijs van de game
     * @returns Een promise met de response
     */
    public async addToCart(gameId: number, quantity: number = 1, price: number): Promise<AddToCartResponse> {
        try {
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud";

            // Doe een POST-verzoek naar de backend API
            const response: Response = await fetch(`${API_BASE}/api/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    game_id: gameId,
                    quantity,
                    price,
                }),
                credentials: "include",
            });

            // Verwerk de response
            const data: AddToCartResponse = await response.json() as AddToCartResponse;
            if (!response.ok) {
                if (response.status === 401) {
                    return {
                        success: false,
                        message: "Gebruiker niet ingelogd",
                    };
                }
                return {
                    success: false,
                    message: data.message || `Fout: ${response.statusText}`,
                };
            }
            return {
                success: true,
                message: data.message,
            };
        }
        catch (error) {
            console.error("Fout in add to cart service:", error);
            return {
                success: false,
                message: "Er is een fout opgetreden bij het toevoegen aan winkelmandje",
            };
        }
    }
}
