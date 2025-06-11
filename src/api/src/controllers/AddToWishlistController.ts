import { Request, Response } from "express";
import { AddToWishlistService } from "../services/AddToWishlistService";

/**
 * Controller die verantwoordelijk is voor het afhandelen van toevoegen aan favorieten
 */
export class AddToWishlistController {
    private readonly _addToWishlistService: AddToWishlistService = new AddToWishlistService();

    public async addToWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | undefined = req.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Gebruiker is niet ingelogd",
                });
                return;
            }

            // Haal game details uit het request body
            const gameId: number = Number((req.body as { game_id: string }).game_id);

            console.log("Toevoegen aan favorieten:", { userId, gameId });

            // Valideer de request data
            if (!gameId) {
                res.status(400).json({
                    success: false,
                    message: "Ontbrekende game_id in verzoek",
                });
                return;
            }

            // Gebruik de service om het item toe te voegen
            const result: { success: boolean; message: string } = await this._addToWishlistService.addToWishlist({
                gameId,
                userId,
            });

            if (result.success) {
                res.status(201).json({
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
            console.error("Fout bij toevoegen aan favorieten:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het toevoegen aan favorieten",
            });
        }
    }
}
