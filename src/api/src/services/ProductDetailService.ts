import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import { Game } from "@api/types/Game";

export class GameService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async getGameById(gameId: string): Promise<Game | null> {
        const connection: PoolConnection = await this._db.openConnection();

        try {
            const [rows] = await connection.query(
        `
        SELECT id, title, thumbnail, descriptionHtml
        FROM games
        WHERE id = ?
        `,
        [gameId]
            );

            if (!Array.isArray(rows) || rows.length === 0) {
                return null;
            }

            const game: Game = rows[0] as Game;
            return game;
        }
        catch (e) {
            throw new Error(`Kan game niet ophalen: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
