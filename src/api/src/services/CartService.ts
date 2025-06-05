import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import type { CartItem } from "../types/CartItem";

// Service die database operaties uitvoert voor de winkelwagen (ophalen en verwijderen van items via SQL queries)
export class CartService {
    private readonly _databaseService: DatabaseService = new DatabaseService();

    // Haalt via een SQL JOIN query alle winkelwagen items op met game informatie (titel, thumbnail) voor een specifieke gebruiker
    public async getCartItemsByUser(userId: number): Promise<CartItem[]> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            return await this._databaseService.query<CartItem[]>(
                connection,
                `
                SELECT 
                    ci.id,
                    ci.user_id,
                    ci.game_id,
                    ci.quantity,
                    ci.price,
                    g.Title AS title,
                    g.Thumbnail AS thumbnail
                FROM cart_items ci
                JOIN games g ON ci.game_id = g.id
                WHERE ci.user_id = ?
                `,
                userId
            );
        }
        finally {
            connection.release();
        }
    }

    // Verwijdert een specifiek winkelwagen item uit de database na controle of het item bij de juiste gebruiker hoort
    public async deleteCartItemById(cartItemId: number, userId: number): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            await connection.execute(
                "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
                [cartItemId, userId]
            );
        }
        catch (error) {
            console.error("Database error bij verwijderen cart item:", error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
}
