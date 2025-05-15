import { DatabaseService } from "./DatabaseService";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

export class OrderService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async createOrder(
        sessionId: string,
        orderNumber: string,
        totalPrice: number
    ): Promise<number> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const result: ResultSetHeader = await this._db.query<ResultSetHeader>(
                connection,
                `
                INSERT INTO \`order\` (session_id, order_number, total_price)
                VALUES (?, ?, ?)

                `,
                sessionId,
                orderNumber,
                totalPrice
            );

            return result.insertId;
        }
        catch (e) {
            throw new Error(`Bestelling maken mislukt: ${e}`);
        }
        finally {
            connection.release();
        }
    }

    public async getCartItemsBySession(sessionId: string): Promise<
        { title: string; quantity: number; price: number }[]
    > {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows] = await connection.query(
                `
                SELECT g.title, ci.quantity, ci.price
                FROM cart_item ci
                JOIN games g ON ci.game_id = g.id
                WHERE ci.session_id = ?
                `,
                [sessionId]
            );
            return rows as { title: string; quantity: number; price: number }[];
        }
        catch (e) {
            throw new Error(`Kan cart items niet ophalen: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
