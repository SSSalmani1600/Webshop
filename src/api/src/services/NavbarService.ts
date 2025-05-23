import { DatabaseService } from "./DatabaseService";
import { PoolConnection, RowDataPacket, FieldPacket } from "mysql2/promise";

type CountRow = { count: number | null };

export class NavbarService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async getCartItemCount(userId: number): Promise<number> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows]: [RowDataPacket[], FieldPacket[]] = await connection.query(
                `
                SELECT SUM(quantity) AS count
                FROM cart
                WHERE user_id = ?
                `,
                [userId]
            );

            if (!Array.isArray(rows) || rows.length === 0) {
                return 0;
            }

            const row: CountRow = rows[0] as CountRow;
            return row.count ?? 0;
        }
        catch (e) {
            throw new Error(`Kan aantal winkelmand-items niet ophalen: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
