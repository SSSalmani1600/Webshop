import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import { Game } from "@api/types/Game";

export class GameSearchService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async searchGamesByTitle(query: string): Promise<Game[]> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows] = await connection.query(
                `
                SELECT id, title, thumbnail, descriptionHtml
                FROM games
                WHERE hidden = 0 AND title LIKE ?
                `,
                [`%${query}%`]
            );

            return rows as Game[];
        }
        catch (e) {
            throw new Error(`Zoeken naar games mislukt: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
