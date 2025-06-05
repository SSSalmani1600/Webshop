import { DiscountValidationResult, ThirdPartyDiscountCode } from "../interfaces/IDiscountService";

// Service die kortingscodes valideert via externe API en een fallback systeem heeft voor als de API niet beschikbaar is
export class DiscountService {
    // URL thirdparty API voor kortingscodes
    private readonly API_BASE_URL = "http://oege.ie.hva.nl:8999/api/discount_codes";

    // Standaard opties voor het maken van API requests
    private readonly FETCH_OPTIONS: RequestInit = {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    };

    // Testcode die wordt gebruikt als de externe API niet bereikbaar is
    private readonly fallbackCode: ThirdPartyDiscountCode = {
        code: "TEST123", // Code die gebruikers kunnen invoeren
        amount: 15, // 15% korting
        currency: "EUR", // Altijd in euros
        validUntil: "2026-12-31", // Geldig tot eind 2026
        createdOn: "2024-01-01",
        usedOn: null,
        valid: true,
    };

    // Valideert een kortingscode via de externe API en valt terug op de testcode als de API niet beschikbaar is
    public async validateDiscountCode(code: string, _amount: number): Promise<DiscountValidationResult> {
        try {
            // Bouw de URL op voor de API call met de ingevoerde code
            const url: string = `${this.API_BASE_URL}/${encodeURIComponent(code)}`;

            // Probeer de kortingscode te valideren via de externe API
            const response: Response = await fetch(url, this.FETCH_OPTIONS);

            if (!response.ok) {
                throw new Error("API niet bereikbaar");
            }

            // Parse de response en zoek naar een geldige code
            const data: ThirdPartyDiscountCode[] = await response.json() as ThirdPartyDiscountCode[];
            const validCode: ThirdPartyDiscountCode | undefined = data.find(c => c.code === code && c.valid);

            // Als geen geldige code gevonden is
            if (!validCode) {
                return { valid: false };
            }

            // Stuur de korting terug als de code geldig is
            return {
                valid: true,
                discountPercentage: validCode.amount,
                code: validCode.code,
            };
        }
        catch (error) {
            // Log de error en val terug op de test kortingscode
            console.warn("Valideer via fallback (API faalde):", error);

            // Als de ingevoerde code overeenkomt met onze test code
            if (code === this.fallbackCode.code) {
                return {
                    valid: true,
                    discountPercentage: this.fallbackCode.amount,
                    code: this.fallbackCode.code,
                };
            }

            // Anders is de code ongeldig
            return { valid: false };
        }
    }
}
