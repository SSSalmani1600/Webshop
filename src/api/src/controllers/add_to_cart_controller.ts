import { Request, Response } from "express";
import { AddToCartService } from "../services/AddToCartService";

/**
 * Controller die verantwoordelijk is voor het afhandelen van toevoegen aan winkelmandje
 */
export class AddToCartController {
    private readonly _addToCartService: AddToCartService = new AddToCartService();

    /**
     * Voeg een game toe aan het winkelmandje
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    public async addToCart(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | undefined = req.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Gebruiker is niet ingelogd",
                });
                return;
            }

            // Haal game details uit het request body (zonder prijs)
            const gameId: number = Number((req.body as { game_id: string }).game_id);
            const quantity: number = Number((req.body as { quantity?: string }).quantity) || 1;

            console.log("Toevoegen aan winkelmandje:", { userId, gameId, quantity });

            // Valideer de request data (prijs wordt nu server-side opgehaald)
            if (!gameId) {
                res.status(400).json({
                    success: false,
                    message: "Ontbrekende game_id in verzoek",
                });
                return;
            }

            // Gebruik de service om het item toe te voegen (prijs wordt automatisch opgehaald)
            const result: { success: boolean; message: string } = await this._addToCartService.addToCart({
                gameId,
                quantity,
                userId,
            });

            if (result.success) {
                const statusCode: number = result.message.includes("bijgewerkt") ? 200 : 201;
                res.status(statusCode).json({
                    success: true,
                    message: result.message,
                });
            }
            else {
                const statusCode: number = result.message === "Game niet gevonden" ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: result.message,
                });
            }
        }
        catch (error) {
            console.error("Fout bij toevoegen aan winkelmandje:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het toevoegen aan winkelmandje",
            });
        }
    }
}
