import { DiscountValidationResult, ThirdPartyDiscountCode } from "../interfaces/IDiscountService";

// Deze service controleert kortingscodes en heeft een backup plan als de externe API niet werkt
export class DiscountService {
    // Dit is het adres van de externe API die we gebruiken voor kortingscodes
    private readonly API_BASE_URL = "http://oege.ie.hva.nl:8999/api/discount_codes";

    private readonly FETCH_OPTIONS: RequestInit = {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    };

    // Dit is een test kortingscode die we gebruiken als de externe API niet werkt
    private readonly fallbackCode: ThirdPartyDiscountCode = {
        code: "TEST123",
        amount: 15,
        currency: "EUR",
        validUntil: "2026-12-31",
        createdOn: "2024-01-01",
        usedOn: null,
        valid: true,
    };

    // Deze functie controleert of een kortingscode geldig is
    public async validateDiscountCode(code: string, _amount: number): Promise<DiscountValidationResult> {
        try {
            // We maken de URL waar we de code gaan controleren
            const url: string = `${this.API_BASE_URL}/${encodeURIComponent(code)}`;

            // We vragen aan de externe API of de code geldig is
            const response: Response = await fetch(url, this.FETCH_OPTIONS);

            // Als er iets mis gaat met de API
            if (!response.ok) {
                throw new Error("API niet bereikbaar");
            }

            // We lezen het antwoord van de API
            const data: ThirdPartyDiscountCode[] = await response.json() as ThirdPartyDiscountCode[];
            // We zoeken naar een geldige code die overeenkomt met wat de klant heeft ingevoerd
            const validCode: ThirdPartyDiscountCode | undefined = data.find(c => c.code === code && c.valid);

            // Als we geen geldige code vinden
            if (!validCode) {
                return { valid: false };
            }

            // Als we wel een geldige code vinden, sturen we de korting terug
            return {
                valid: true,
                discountPercentage: validCode.amount,
                code: validCode.code,
            };
        }
        catch (error) {
            // Als er iets mis gaat met de API, gebruiken we de test code
            console.warn("Valideer via fallback (API faalde):", error);

            // Als de klant de test code heeft ingevoerd
            if (code === this.fallbackCode.code) {
                return {
                    valid: true,
                    discountPercentage: this.fallbackCode.amount,
                    code: this.fallbackCode.code,
                };
            }

            // Als het niet de test code is, is de code ongeldig
            return { valid: false };
        }
    }
}
