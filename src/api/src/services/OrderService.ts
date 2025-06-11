import { DatabaseService } from "./DatabaseService";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

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
                `INSERT INTO \`order\` (user_id, order_number, total_price, created_at)
                 VALUES (?, ?, ?, NOW())`,
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

    public async getUserEmailById(userId: number): Promise<string> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows] = await connection.query<RowDataPacket[]>(
                "SELECT email FROM users WHERE id = ?",
                [userId]
            );
            const result: { email: string } | null = Array.isArray(rows) ? rows[0] as { email: string } : null;
            return result?.email ?? "";
        }
        catch (e) {
            console.error("Fout in getUserEmailById:", e);
            throw new Error(`Kan e-mailadres niet ophalen: ${e instanceof Error ? e.message : e}`);
        }
        finally {
            connection.release();
        }
    }

    public async getUserNameById(userId: number): Promise<string> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows] = await connection.query<RowDataPacket[]>(
                "SELECT username FROM users WHERE id = ?",
                [userId]
            );
            const result: { username: string } | null = Array.isArray(rows) ? rows[0] as { username: string } : null;
            return result?.username ?? "";
        }
        catch (e) {
            console.error("Fout in getUserNameById:", e);
            throw new Error(`Kan gebruikersnaam niet ophalen: ${e instanceof Error ? e.message : e}`);
        }
        finally {
            connection.release();
        }
    }

    public async getGamesByOrderId(orderId: number): Promise<
        { title: string; image_url: string; quantity: number; price: number }[]
    > {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows] = await connection.query<RowDataPacket[]>(
                `SELECT g.title, g.Thumbnail AS image_url, og.quantity, og.price
                 FROM order_games og
                 JOIN games g ON og.game_id = g.id
                 WHERE og.order_id = ?`,
                [orderId]
            );

            return rows as { title: string; image_url: string; quantity: number; price: number }[];
        }
        catch (e) {
            console.error("Fout bij getGamesByOrderId:", e);
            throw new Error(`Kon gekochte games niet ophalen: ${e instanceof Error ? e.message : e}`);
        }
        finally {
            connection.release();
        }
    }
}
