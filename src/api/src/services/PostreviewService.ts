import { DatabaseService } from "@api/services/DatabaseService";
import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

export class PostreviewService {
    private readonly db = new DatabaseService();

    public async addReview(userId: number, gameId: number, rating: number, comment: string): Promise<void> {
        const connection: PoolConnection = await this.db.openConnection();

        try {
            const query = `
                INSERT INTO review (user_id, game_id, rating, comment)
                VALUES (?, ?, ?, ?)
            `;
            await this.db.query<ResultSetHeader>(connection, query, userId, gameId, rating, comment);
        } finally {
            connection.release();
        }
    }

    public async getReviewsForGame(gameId: number): Promise<{ rating: number; comment: string }[]> {
        const connection: PoolConnection = await this.db.openConnection();

        try {
            const [rows] = await connection.query(
                `SELECT rating, comment FROM review WHERE game_id = ?`,
                [gameId]
            );
            return rows as { rating: number; comment: string }[];
        } finally {
            connection.release();
        }
    }
}
