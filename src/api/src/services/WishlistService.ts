import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import type { ResultSetHeader } from "mysql2";
import type { WishlistItem } from "../types/WishlistItem";

export class WishlistService {
    private readonly _databaseService: DatabaseService = new DatabaseService();

    public async getWishlistItemsByUser(userId: number): Promise<WishlistItem[]> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            const items: WishlistItem[] = await this._databaseService.query<WishlistItem[]>(
                connection,
                `
                SELECT 
                    wi.id,
                    wi.user_id,
                    wi.game_id,
                    wi.created_at,
                    g.Title AS title,
                    g.Thumbnail AS thumbnail
                FROM wishlist_items wi
                JOIN games g ON wi.game_id = g.id
                WHERE wi.user_id = ?
                ORDER BY wi.created_at DESC
                `,
                userId
            );

            return items;
        }
        catch (error) {
            console.error("Database error bij ophalen wishlist items:", error);
            throw new Error("Kon favorieten niet ophalen");
        }
        finally {
            connection.release();
        }
    }

    public async deleteWishlistItemById(wishlistItemId: number, userId: number): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            const [result] = await connection.execute<ResultSetHeader>(
                "DELETE FROM wishlist_items WHERE id = ? AND user_id = ?",
                [wishlistItemId, userId]
            );

            if (result.affectedRows === 0) {
                throw new Error("Item niet gevonden of geen toegang");
            }
        }
        catch (error) {
            console.error("Database error bij verwijderen wishlist item:", error);
            throw new Error("Kon item niet verwijderen");
        }
        finally {
            connection.release();
        }
    }
}
