import { DiscountCode, DiscountValidationResult, ThirdPartyDiscountCode } from "../interfaces/IDiscountService";

export class DiscountService {
    private readonly API_BASE_URL = "https://oege.ie.hva.nl:8887/api/discount_codes";
    private readonly FETCH_OPTIONS: RequestInit = {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    };

    // Fallback code for when the API is not accessible
    private readonly fallbackCode: ThirdPartyDiscountCode = {
        code: "TEST123",
        amount: 15,
        currency: "EUR",
        validUntil: "2026-12-31",
        createdOn: "2024-01-01",
        usedOn: null,
        valid: true,
    };

    public async validateDiscountCode(code: string): Promise<DiscountValidationResult> {
        try {
            // First try to get codes from the API
            let allCodes: DiscountCode[];
            try {
                allCodes = await this.getAllDiscountCodes();
                console.log("Successfully fetched codes from API:", allCodes);
            }
            catch (error) {
                console.log("API not accessible, using fallback code:", error);
                // If API fails, use fallback code
                allCodes = [{
                    code: this.fallbackCode.code,
                    discount: this.fallbackCode.amount,
                    expires_at: this.fallbackCode.validUntil,
                    valid: this.fallbackCode.valid && new Date(this.fallbackCode.validUntil) > new Date(),
                }];
            }

            console.log("Validating code:", code, "against codes:", allCodes);
            const matchedCode: DiscountCode | undefined = allCodes.find(dc => dc.code === code);

            if (!matchedCode || !matchedCode.valid) {
                console.log("No valid matching code found");
                return { valid: false };
            }

            const now: Date = new Date();
            const expiryDate: Date = new Date(matchedCode.expires_at);

            if (expiryDate <= now) {
                console.log("Code has expired");
                return { valid: false };
            }

            console.log("Code is valid, applying discount:", matchedCode.discount);
            return {
                valid: true,
                discountPercentage: matchedCode.discount,
                code: matchedCode.code,
            };
        }
        catch (error) {
            console.error("Discount validation error:", error);
            return { valid: false };
        }
    }

    public async getAllDiscountCodes(): Promise<DiscountCode[]> {
        try {
            console.log("Fetching discount codes from:", this.API_BASE_URL);
            const response: Response = await fetch(this.API_BASE_URL, this.FETCH_OPTIONS);

            if (!response.ok) {
                console.error("API request failed:", response.status, response.statusText);
                throw new Error(`API request failed with status ${response.status}`);
            }

            const responseText: string = await response.text();
            console.log("Raw API response:", responseText);

            if (!responseText) {
                console.log("Empty response, using fallback code");
                return [{
                    code: this.fallbackCode.code,
                    discount: this.fallbackCode.amount,
                    expires_at: this.fallbackCode.validUntil,
                    valid: this.fallbackCode.valid && new Date(this.fallbackCode.validUntil) > new Date(),
                }];
            }

            let jsonData: unknown;
            try {
                jsonData = JSON.parse(responseText);
            }
            catch (error) {
                console.error("Failed to parse JSON response:", error);
                throw new Error("Invalid JSON response from API");
            }

            if (!Array.isArray(jsonData)) {
                console.error("Response is not an array:", jsonData);
                throw new Error("Invalid response format - expected array");
            }

            const data: ThirdPartyDiscountCode[] = jsonData as ThirdPartyDiscountCode[];
            console.log("Parsed discount codes:", data);

            return data.map(item => ({
                code: item.code,
                discount: item.amount,
                expires_at: item.validUntil,
                valid: item.valid && new Date(item.validUntil) > new Date(),
            }));
        }
        catch (error) {
            console.error("Error fetching discount codes:", error);
            // Return fallback code instead of throwing
            return [{
                code: this.fallbackCode.code,
                discount: this.fallbackCode.amount,
                expires_at: this.fallbackCode.validUntil,
                valid: this.fallbackCode.valid && new Date(this.fallbackCode.validUntil) > new Date(),
            }];
        }
    }
}
