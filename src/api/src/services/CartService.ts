import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";

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
    private readonly _databaseService: DatabaseService = new DatabaseService();

    public async getCartItemsByUser(userId: number): Promise<CartItem[]> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            const result: CartItem[] = await this._databaseService.query<CartItem[]>(
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

            return result;
        }
        catch (e: unknown) {
            throw new Error(`Failed to fetch cart items: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
