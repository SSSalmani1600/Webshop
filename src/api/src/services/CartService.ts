import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import { Request } from "express";

export type CartItem = {
    id: number;
    user_id: number;
    game_id: number;
    quantity: number;
    price: number;
    title: string;
    thumbnail: string;
};

export class CartService {
    private readonly _databaseService = new DatabaseService();

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
        finally {
            connection.release();
        }
    }
}
