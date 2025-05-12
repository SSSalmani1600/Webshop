import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";

export class GameService {
    private readonly _db: DatabaseService = new DatabaseService();

    public async getGameById(gameId: string): Promise<{
        id: number;
        title: string;
        thumbnail: string;
        descriptionHtml: string;
    } | null> {
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
        }

    }
}
