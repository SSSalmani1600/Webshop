import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import type { CartItem } from "../types/CartItem";

export class CartService {
    private readonly _databaseService: DatabaseService = new DatabaseService();

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
