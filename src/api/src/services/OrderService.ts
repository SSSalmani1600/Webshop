import { DatabaseService } from "./DatabaseService";
import { PoolConnection, ResultSetHeader } from "mysql2";

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
        } catch (e) {
            throw new Error(`Failed to create order: ${e}`);
        } finally {
            connection.release();
        }
    }
}
