import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";

/**
 * Interface voor cart item data
 */
interface CartItemData {
    gameId: number;
    quantity: number;
    price: number;
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
     * @param cartItem - De cart item data
     * @returns Een promise die wordt resolved als het item is toegevoegd
     */
    public async addToCart(cartItem: CartItemData): Promise<{ success: boolean; message: string }> {
        const connection: PoolConnection = await this.databaseService.openConnection();

        try {
            // Controleer of de game bestaat
            const gameExists: boolean = await this.checkGameExists(connection, cartItem.gameId);
            if (!gameExists) {
                return {
                    success: false,
                    message: "Game niet gevonden",
                };
            }

            // Controleer of het item al in het winkelmandje zit
            const existingCartItem: { id: number }[] = await this.databaseService.query(
                connection,
                "SELECT * FROM cart_items WHERE user_id = ? AND game_id = ?",
                cartItem.userId,
                cartItem.gameId
            );

            // Als het item al bestaat, update de hoeveelheid
            if (Array.isArray(existingCartItem) && existingCartItem.length > 0) {
                await this.databaseService.query(
                    connection,
                    "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND game_id = ?",
                    cartItem.quantity,
                    cartItem.userId,
                    cartItem.gameId
                );

                return {
                    success: true,
                    message: "Hoeveelheid bijgewerkt in winkelmandje",
                };
            }

            // Voeg nieuw item toe aan het winkelmandje
            await this.databaseService.query(
                connection,
                "INSERT INTO cart_items (user_id, game_id, quantity, price) VALUES (?, ?, ?, ?)",
                cartItem.userId,
                cartItem.gameId,
                cartItem.quantity,
                cartItem.price
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
     * Controleer of een game bestaat
     *
     * @param connection - Database connectie
     * @param gameId - Het ID van de game
     * @returns True als de game bestaat, anders false
     */
    private async checkGameExists(connection: PoolConnection, gameId: number): Promise<boolean> {
        const result: { id: number }[] = await this.databaseService.query(
            connection,
            "SELECT id FROM games WHERE id = ?",
            gameId
        );
        return Array.isArray(result) && result.length > 0;
    }
} 
