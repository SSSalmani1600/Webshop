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
            // Haal de sessie-ID op
            const sessionId: string = await this.getSession();
            console.log("Toevoegen aan winkelmandje met sessie:", sessionId);

            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            // Doe een POST-verzoek naar de backend API
            const response: Response = await fetch(`${API_BASE}/cart/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-session": sessionId,
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
            console.log("Winkelmandje response:", data);

            if (!response.ok) {
                // Als niet ingelogd, geef specifieke foutmelding terug
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

    /**
     * Haal de huidige sessie-ID op
     *
     * @returns Een promise met de sessie-ID
     */
    private async getSession(): Promise<string> {
        const storedSession: string | null = localStorage.getItem("sessionId");
        if (storedSession) return storedSession;

        // Probeer een nieuwe sessie op te halen
        try {
            const API_BASE: string = window.location.hostname.includes("localhost")
                ? "http://localhost:3001"
                : "https://laajoowiicoo13-pb4sea2425.hbo-ict.cloud/api";

            const res: Response = await fetch(`${API_BASE}/session`);
            if (!res.ok) {
                throw new Error(`Fout bij het ophalen van sessie: ${res.status}`);
            }

            const data: { sessionId: string | null } | null = await res.json() as { sessionId: string | null } | null;

            if (data && data.sessionId) {
                // Sla de sessie op voor later gebruik
                localStorage.setItem("sessionId", data.sessionId);
                return data.sessionId;
            }
        }
        catch (error) {
            console.error("Fout bij het ophalen van sessie:", error);
        }

        throw new Error("Kon geen sessie krijgen");
    }
}
