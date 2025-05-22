import { Request, Response } from "express";
import { DatabaseService } from "../services/DatabaseService";
import { PoolConnection } from "mysql2/promise";

/**
 * Controller die verantwoordelijk is voor het afhandelen van toevoegen aan winkelmandje
 */
export class AddToCartController {
    private readonly _databaseService: DatabaseService = new DatabaseService();

    /**
     * Voeg een game toe aan het winkelmandje
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    public async addToCart(req: Request, res: Response): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();

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
            const price: number = Number((req.body as { price: string }).price);

            console.log("Toevoegen aan winkelmandje:", { userId, gameId, quantity, price });

            // Valideer de request data
            if (!gameId || !price) {
                res.status(400).json({
                    success: false,
                    message: "Ontbrekende game_id of price in verzoek",
                });
                return;
            }

            // Controleer of de game bestaat
            const gameExists: boolean = await this.checkGameExists(connection, gameId);
            if (!gameExists) {
                res.status(404).json({
                    success: false,
                    message: "Game niet gevonden",
                });
                return;
            }

            // Controleer of het item al in het winkelmandje zit
            const existingCartItem: { id: number }[] = await this._databaseService.query(
                connection,
                "SELECT * FROM cart_items WHERE user_id = ? AND game_id = ?",
                userId,
                gameId
            );

            // Als het item al bestaat, update de hoeveelheid
            if (Array.isArray(existingCartItem) && existingCartItem.length > 0) {
                await this._databaseService.query(
                    connection,
                    "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND game_id = ?",
                    quantity,
                    userId,
                    gameId
                );

                res.status(200).json({
                    success: true,
                    message: "Hoeveelheid bijgewerkt in winkelmandje",
                });
                return;
            }

            // Voeg nieuw item toe aan het winkelmandje
            await this._databaseService.query(
                connection,
                "INSERT INTO cart_items (user_id, game_id, quantity, price) VALUES (?, ?, ?, ?)",
                userId,
                gameId,
                quantity,
                price
            );

            res.status(201).json({
                success: true,
                message: "Product toegevoegd aan winkelmandje",
            });
        }
        catch (error) {
            console.error("Fout bij toevoegen aan winkelmandje:", error);
            res.status(500).json({
                success: false,
                message: "Er is een fout opgetreden bij het toevoegen aan winkelmandje",
            });
        }
        finally {
            connection.release();
        }
    }

    /**
     * Controleer of een game bestaat
     */
    private async checkGameExists(connection: PoolConnection, gameId: number): Promise<boolean> {
        const result: { id: number }[] = await this._databaseService.query(
            connection,
            "SELECT id FROM games WHERE id = ?",
            gameId
        );
        return Array.isArray(result) && result.length > 0;
    }
}
