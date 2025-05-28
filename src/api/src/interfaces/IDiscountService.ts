export interface ThirdPartyDiscountCode {
    amount: number;
    code: string;
    currency: string;
    validUntil: string;
    createdOn: string;
    usedOn: string | null;
    valid: boolean;
}

export interface DiscountCode {
    code: string;
    discount: number;
    expires_at: string;
    valid: boolean;
    percentage?: number;
    description?: string;
}

export interface DiscountValidationResult {
    valid: boolean;
    discountPercentage?: number;
    code?: string;
}

export interface DiscountCodeRequestBody {
    code: string;
}
