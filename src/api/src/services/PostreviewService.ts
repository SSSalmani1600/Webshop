import { DatabaseService } from "@api/services/DatabaseService";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

interface Review {
    id: number;
    userId: number;
    username: string;
    gameId: number;
    rating: number;
    comment: string;
}

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

    public async getReviewsForGame(gameId: number): Promise<{ rating: number; comment: string; username: string }[]> {
        const connection: PoolConnection = await this.db.openConnection();

        try {
            const [rows] = await connection.query<RowDataPacket[]>(
                `
                SELECT r.id, r.rating, r.comment, u.username
                FROM review r
                JOIN user u ON r.user_id = u.id
                WHERE r.game_id = ?
                `,
                [gameId]
            );
            return rows as { rating: number; comment: string; username: string }[];
        } finally {
            connection.release();
        }
    }

    public async updateReview(reviewId: number, comment: string): Promise<void> {
        const connection: PoolConnection = await this.db.openConnection();

        try {
            const query = `
                UPDATE review
                SET comment = ?
                WHERE id = ?
            `;
            await this.db.query<ResultSetHeader>(connection, query, comment, reviewId);
        } finally {
            connection.release();
        }
    }

    public async getReviewById(reviewId: number): Promise<Review | null> {
        const connection: PoolConnection = await this.db.openConnection();

        try {
            const [rows] = await connection.query<RowDataPacket[]>(
                `
                SELECT r.id, r.user_id AS userId, r.game_id AS gameId, r.rating, r.comment, u.username
                FROM review r
                JOIN user u ON r.user_id = u.id
                WHERE r.id = ?
                `,
                [reviewId]
            );

            if (!rows || rows.length === 0) {
                return null;
            }

            return rows[0] as Review;
        } finally {
            connection.release();
        }
    }

    public async getUsernameByUserId(userId: number): Promise<{ username: string } | null> {
        const connection: PoolConnection = await this.db.openConnection();

        try {
            const [rows] = await connection.query<RowDataPacket[]>(
                `SELECT username FROM user WHERE id = ?`,
                [userId]
            );

            if (!rows || rows.length === 0) {
                return null;
            }

            return rows[0] as { username: string };
        } finally {
            connection.release();
        }
    }
}
