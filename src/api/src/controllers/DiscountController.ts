import { Request, Response } from "express";
import { DiscountService } from "../services/DiscountService";
import { DiscountCodeRequestBody, DiscountCode, DiscountValidationResult } from "../interfaces/IDiscountService";

export class DiscountController {
    private readonly discountService: DiscountService;

    public constructor() {
        this.discountService = new DiscountService();
    }

    public async applyDiscount(req: Request<object, object, DiscountCodeRequestBody>, res: Response): Promise<void> {
        try {
            const { code } = req.body;

            if (!code || typeof code !== "string") {
                res.status(400).json({ success: false });
                return;
            }

            const validation: DiscountValidationResult = await this.discountService.validateDiscountCode(code);

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

    public async getAvailableDiscountCodes(_req: Request, res: Response): Promise<void> {
        try {
            const discountCodes: DiscountCode[] = await this.discountService.getAllDiscountCodes();

            res.json({
                success: true,
                codes: discountCodes.map(dc => ({
                    code: dc.code,
                    discount: dc.discount,
                    expires_at: dc.expires_at,
                    valid: dc.valid,
                    percentage: dc.discount,
                })),
            });
        }
        catch (error) {
            console.error("Error fetching discount codes:", error);
            res.status(500).json({ success: false });
        }
    }
}
