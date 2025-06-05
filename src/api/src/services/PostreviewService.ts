import { DatabaseService } from "@api/services/DatabaseService";
import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

interface ReviewRow {
    rating: number;
    comment: string;
    username: string;
}

interface ReviewRow {
    rating: number;
    comment: string;
    username: string;
}

// service voor communicatie met database
export class PostreviewService {
    private readonly db: DatabaseService = new DatabaseService(); // db helper

    // voeg review toe aan database
    public async addReview(userId: number, gameId: number, rating: number, comment: string): Promise<void> {
        const connection: PoolConnection = await this.db.openConnection(); // maak verbinding

        try {
            // query om review op te slaan
            const query: string = `
                INSERT INTO review (user_id, game_id, rating, comment)
                VALUES (?, ?, ?, ?)
            `;
            // voer query uit met data
            await this.db.query<ResultSetHeader>(connection, query, userId, gameId, rating, comment);
        }
        finally {
            connection.release(); // sluit verbinding
        }
    }

    // haal reviews op van een game
    public async getReviewsForGame(gameId: number): Promise<ReviewRow[]> {
        const connection: PoolConnection = await this.db.openConnection(); // db verbinding openen

        try {
            // haal sterren + comment + username op voor game
            const [rows] = await connection.query(
                `
                SELECT r.rating, r.comment, u.username
                FROM review r
                JOIN user u ON r.user_id = u.id
                WHERE r.game_id = ?
                `,
                [gameId]
            );

            // geef lijst terug
            return rows as ReviewRow[];
        }
        finally {
            connection.release(); // sluit verbinding
        }
    }
}
