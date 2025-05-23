import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";

export class NavbarService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async getCartItemCount(userId: number): Promise<number> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows] = await connection.query(
                `
                SELECT COUNT(*) AS count
                FROM cart
                WHERE user_id = ?
                `,
                [userId]
            );

            if (!Array.isArray(rows) || rows.length === 0) {
                return 0;
            }

            const count: number = (rows[0] as { count: number }).count;
            return count;
        }
        catch (e) {
            throw new Error(`Kan aantal winkelmand-items niet ophalen: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
