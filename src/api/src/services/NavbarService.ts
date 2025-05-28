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
                FROM cart_items
                WHERE user_id = ?
                `,
                [userId]
            );

            const row: CountRow = rows[0] as CountRow;
            return row.count ?? 0;
        } catch (e) {
            console.error("Fout bij ophalen winkelmand-teller:", e);
            throw new Error(`Kan aantal winkelmand-items niet ophalen: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
