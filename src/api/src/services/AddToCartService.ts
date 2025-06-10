import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";

/**
 * Interface voor cart item data (zonder price van client)
 */
interface CartItemData {
    gameId: number;
    quantity: number;
    userId: number;
}

/**
 * Service voor het afhandelen van add to cart functionaliteit
 * Bevat de businesslogica voor het toevoegen van items aan het winkelmandje
 */
export class AddToCartService {
    private databaseService: DatabaseService;

    public constructor() {
        this.databaseService = new DatabaseService();
    }

    /**
     * Voeg een item toe aan het winkelmandje
     *
     * @param cartItem - De cart item data (zonder price)
     * @returns Een promise die wordt resolved als het item is toegevoegd
     */
    public async addToCart(cartItem: CartItemData): Promise<{ success: boolean; message: string }> {
        const connection: PoolConnection = await this.databaseService.openConnection();

        try {
            // Controleer of de game bestaat en haal de prijs op uit de database
            const gameData: { id: number; price: number } | null = await this.getGameWithPrice(connection, cartItem.gameId);
            if (!gameData) {
                return {
                    success: false,
                    message: "Game niet gevonden",
                };
            }

            const price: number = gameData.price;
            if (price <= 0) {
                return {
                    success: false,
                    message: "Prijs niet beschikbaar voor deze game",
                };
            }

            // Controleer of het item al in het winkelmandje zit
            const existingCartItem: { id: number }[] = await this.databaseService.query(
                connection,
                "SELECT * FROM cart_items WHERE user_id = ? AND game_id = ?",
                cartItem.userId,
                cartItem.gameId
            );

            // Als het item al bestaat, update de hoeveelheid en prijs
            if (Array.isArray(existingCartItem) && existingCartItem.length > 0) {
                await this.databaseService.query(
                    connection,
                    "UPDATE cart_items SET quantity = quantity + ?, price = ? WHERE user_id = ? AND game_id = ?",
                    cartItem.quantity,
                    price,
                    cartItem.userId,
                    cartItem.gameId
                );

                return {
                    success: true,
                    message: "Hoeveelheid bijgewerkt in winkelmandje",
                };
            }

            // Voeg nieuw item toe aan het winkelmandje met actuele prijs uit database
            await this.databaseService.query(
                connection,
                "INSERT INTO cart_items (user_id, game_id, quantity, price) VALUES (?, ?, ?, ?)",
                cartItem.userId,
                cartItem.gameId,
                cartItem.quantity,
                price
            );

            return {
                success: true,
                message: "Product toegevoegd aan winkelmandje",
            };
        }
        finally {
            connection.release();
        }
    }

    /**
     * Haal game data inclusief prijs op uit de database
     *
     * @param connection - Database connectie
     * @param gameId - Het ID van de game
     * @returns Game data met prijs of null als niet gevonden
     */
    private async getGameWithPrice(connection: PoolConnection, gameId: number): Promise<{ id: number; price: number } | null> {
        try {
            const result: { id: number; price: number }[] = await this.databaseService.query(
                connection,
                "SELECT id, price FROM games WHERE id = ?",
                gameId
            );
            
            if (Array.isArray(result) && result.length > 0) {
                return result[0];
            }
            
            return null;
        } catch (error) {
            console.error(`Error fetching game data for game ${gameId}:`, error);
            return null;
        }
    }
}
