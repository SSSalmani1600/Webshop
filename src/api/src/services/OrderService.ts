import { DatabaseService } from "./DatabaseService";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

export class OrderService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async createOrder(
        userId: number,
        orderNumber: string,
        totalPrice: number
    ): Promise<number> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const result: ResultSetHeader = await this._db.query<ResultSetHeader>(
                connection,
                `INSERT INTO \`order\` (user_id, order_number, total_price)
                 VALUES (?, ?, ?)`,
                [userId, orderNumber, totalPrice]
            );

            return result.insertId;
        }
        catch (e) {
            throw new Error(`Bestelling maken mislukt: ${e instanceof Error ? e.message : e}`);
        }
        finally {
            connection.release();
        }
    }

    public async getCartItemsByUser(userId: number): Promise<
        { title: string; quantity: number; price: number }[]
    > {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows] = await connection.query(
                `
                SELECT g.title, ci.quantity, ci.price
                FROM cart_item ci
                JOIN games g ON ci.game_id = g.id
                WHERE ci.user_id = ?
                `,
                [userId]
            );
            return rows as { title: string; quantity: number; price: number }[];
        }
        catch (e) {
            console.error("Fout in getCartItemsByUser:", e);
            throw new Error(`Kan cart items niet ophalen: ${e instanceof Error ? e.message : e}`);
        }
        finally {
            connection.release();
        }
    }
}
