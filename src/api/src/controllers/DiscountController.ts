import { Request, Response } from "express";
import { DiscountService } from "../services/DiscountService";
import { DiscountCodeRequestBody, DiscountValidationResult } from "../interfaces/IDiscountService";

// Controller die HTTP requests afhandelt voor het valideren van kortingscodes via de DiscountService
export class DiscountController {
    private readonly discountService: DiscountService;

    public constructor() {
        this.discountService = new DiscountService();
    }

    // Valideert een kortingscode via de service en stuurt het kortingspercentage of een foutmelding terug naar de client
    public async applyDiscount(req: Request<object, object, DiscountCodeRequestBody>, res: Response): Promise<void> {
        try {
            const { code } = req.body;

            if (!code || typeof code !== "string") {
                res.status(400).json({ success: false });
                return;
            }

            const validation: DiscountValidationResult = await this.discountService.validateDiscountCode(code, 0);

            res.json({
                success: validation.valid,
                valid: validation.valid,
                discountPercentage: validation.discountPercentage || 0,
                code: code,
            });
        }
        catch (error) {
            console.error("Error applying discount:", error);
            res.status(500).json({ success: false });
        }
    }
}
