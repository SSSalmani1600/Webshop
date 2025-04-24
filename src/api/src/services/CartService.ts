import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";

export type CartItem = {
    id: number;
    session_id: string;
    game_id: number;
    quantity: number;
    price: number;
};

export class CartService {
    private readonly _databaseService: DatabaseService = new DatabaseService();

    public async getCartItems(sessionId: string): Promise<CartItem[]> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            const result: CartItem[] = await this._databaseService.query<CartItem[]>(
                connection,
            `
            SELECT 
              ci.id,
              ci.session_id,
              ci.game_id,
              ci.quantity,
              ci.price,
              g.Title AS title,
              g.Thumbnail AS thumbnail
            FROM cart_items ci
            JOIN games g ON ci.game_id = g.id
            WHERE ci.session_id = ?
            `,
            sessionId
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
