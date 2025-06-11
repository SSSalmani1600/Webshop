import { Request, Response } from "express";
import { AddToCartService } from "../services/AddToCartService";
import { ActionService } from "../services/ActionService";
import { Actie } from "@api/types/Actie";

export class AddToCartController {
    private readonly _addToCartService = new AddToCartService();
    private readonly _actionService = new ActionService();

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

            // Haal game details uit het request body
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

            // Voeg hoofdproduct toe aan winkelmandje
            const result: {
                success: boolean;
                message: string;
            } = await this._addToCartService.addToCart({
                gameId,
                quantity,
                userId,
            });

            if (!result.success) {
                const statusCode: number = result.message === "Game niet gevonden" ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: result.message,
                });
                return;
            }

            // Controleren op bijbehorende actie
            const actie: Actie | null = await this._actionService.getActieByProductA(gameId);

            if (actie) {
                // Voeg gratis actieproduct toe
                await this._addToCartService.addToCart({
                    gameId: actie.product_b_id,
                    quantity: 1,
                    // price: 0,
                    userId,
                    isFree: true,
                });
            }

            res.status(actie ? 200 : 201).json({
                success: true,
                message: result.message + (actie ? " + gratis actie-spel toegevoegd" : ""),
                actieToegevoegd: !!actie,
                gratisProductId: actie ? actie.product_b_id : null,
            });
        }
        catch (error) {
            console.error("Fout bij toevoegen aan winkelmandje:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het toevoegen aan winkelmandje",
            });
        }
    }
};
