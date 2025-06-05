import { DiscountValidationResult, ThirdPartyDiscountCode } from "../interfaces/IDiscountService";

export class DiscountService {
    private readonly API_BASE_URL = "http://oege.ie.hva.nl:8999/api/discount_codes";
    private readonly FETCH_OPTIONS: RequestInit = {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    };

    // third party API werkt alleen op school netwerk, dus fallback code
    private readonly fallbackCode: ThirdPartyDiscountCode = {
        code: "TEST123",
        amount: 15,
        currency: "EUR",
        validUntil: "2026-12-31",
        createdOn: "2024-01-01",
        usedOn: null,
        valid: true,
    };

    public async validateDiscountCode(code: string, _amount: number): Promise<DiscountValidationResult> {
        try {
            const url: string = `${this.API_BASE_URL}/${encodeURIComponent(code)}`;
            const response: Response = await fetch(url, this.FETCH_OPTIONS);

            if (!response.ok) {
                throw new Error("API niet bereikbaar");
            }

            const data: ThirdPartyDiscountCode[] = await response.json() as ThirdPartyDiscountCode[];
            const validCode: ThirdPartyDiscountCode | undefined = data.find(c => c.code === code && c.valid);

            if (!validCode) {
                return { valid: false };
            }

            return {
                valid: true,
                discountPercentage: validCode.amount,
                code: validCode.code,
            };
        }
        catch (error) {
            console.warn("Valideer via fallback (API faalde):", error);

            if (code === this.fallbackCode.code) {
                return {
                    valid: true,
                    discountPercentage: this.fallbackCode.amount,
                    code: this.fallbackCode.code,
                };
            }

            return { valid: false };
        }
    }
}
