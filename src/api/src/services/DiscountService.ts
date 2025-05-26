import { DiscountValidationResult, ThirdPartyDiscountCode } from "../interfaces/IDiscountService";

interface DiscountApiResponse {
    code: string;
    discountPercentage: number;
}

export class DiscountService {
    private readonly API_BASE_URL = "http://oege.ie.hva.nl:8999/api/discount_code";
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

    public async validateDiscountCode(code: string, amount: number): Promise<DiscountValidationResult> {
        try {
            const url: string = `${this.API_BASE_URL}?code=${encodeURIComponent(code)}&amount=${amount}`;
            const response: Response = await fetch(url, this.FETCH_OPTIONS);

            if (!response.ok) {
                throw new Error("API niet bereikbaar");
            }

            const data: DiscountApiResponse = await response.json() as DiscountApiResponse;

            if (!data.discountPercentage || data.code !== code) {
                return { valid: false };
            }

            return {
                valid: true,
                discountPercentage: data.discountPercentage,
                code: data.code,
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
