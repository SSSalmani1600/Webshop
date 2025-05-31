import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import type { WishlistItem } from "../types/WishlistItem";

export class WishlistService {
    private readonly _databaseService: DatabaseService = new DatabaseService();

    public async getWishlistItemsByUser(userId: number): Promise<WishlistItem[]> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            return await this._databaseService.query<WishlistItem[]>(
                connection,
                `
                SELECT 
                    wi.id,
                    wi.user_id,
                    wi.game_id,
                    wi.quantity,
                    wi.price,
                    g.Title AS title,
                    g.Thumbnail AS thumbnail
                FROM wishlist_items wi
                JOIN games g ON wi.game_id = g.id
                WHERE wi.user_id = ?
                `,
                userId
            );
        }
        finally {
            connection.release();
        }
    }

    public async deleteWishlistItemById(wishlistItemId: number, userId: number): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            await connection.execute(
                "DELETE FROM wishlist_items WHERE id = ? AND user_id = ?",
                [wishlistItemId, userId]
            );
        }
        catch (error) {
            console.error("Database error bij verwijderen wishlist item:", error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
}
