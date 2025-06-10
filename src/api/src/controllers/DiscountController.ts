import { Request, Response } from "express";
import { DiscountService } from "../services/DiscountService";
import { DiscountCodeRequestBody, DiscountValidationResult } from "../interfaces/IDiscountService";

// Deze controller handelt alle verzoeken af voor het controleren van kortingscodes
export class DiscountController {
    // We maken een instantie van de service die kortingscodes controleert
    private readonly discountService: DiscountService;

    public constructor() {
        // Maak een nieuwe instantie van de DiscountService
        this.discountService = new DiscountService();
    }

    // Deze functie verwerkt het verzoek om een kortingscode te controleren
    public async applyDiscount(req: Request<object, object, DiscountCodeRequestBody>, res: Response): Promise<void> {
        try {
            // Haal de kortingscode uit het verzoek
            const { code } = req.body;

            // Controleer of er wel een code is meegegeven en of het een tekst is
            if (!code || typeof code !== "string") {
                res.status(400).json({ success: false });
                return;
            }

            // Vraag aan de service of de code geldig is
            const validation: DiscountValidationResult = await this.discountService.validateDiscountCode(code, 0);

            // Stuur het resultaat terug naar de klant
            res.json({
                success: validation.valid,
                valid: validation.valid,
                discountPercentage: validation.discountPercentage || 0,
                code: code,
            });
        }
        catch (error) {
            // Als er iets mis gaat, log de fout en stuur een foutmelding terug
            console.error("Error applying discount:", error);
            res.status(500).json({ success: false });
        }
    }
}
