import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";

/**
 * Interface voor een willekeurige game response
 */
export interface RandomGameData {
    id: number;
    title: string;
    thumbnail?: string;
}

/**
 * Service voor het ophalen van willekeurige games
 * Handelt "Verras mij" functionaliteit af
 */
export class RandomGameService {
    private readonly _databaseService: DatabaseService;

    public constructor() {
        this._databaseService = new DatabaseService();
    }

    /**
     * Haalt een willekeurige game op uit de database
     * @returns Een Promise met willekeurige game data of null als er geen games zijn
     */
    public async getRandomGame(): Promise<RandomGameData | null> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            // Haal een willekeurige game op uit de database
            const result: RandomGameData[] = await this._databaseService.query<RandomGameData[]>(
                connection,
                "SELECT id, title, thumbnail FROM games ORDER BY RAND() LIMIT 1"
            );

            // Return de game of null als er geen games zijn
            return result.length > 0 ? result[0] : null;
        }
        catch (e: unknown) {
            throw new Error(`Failed to retrieve random game: ${e}`);
        }
        finally {
            connection.release();
        }
    }

    /**
     * Haalt het totaal aantal games op (voor statistieken) dus toont het aantal games.
     * @returns Het aantal games in de database
     */
    public async getTotalGamesCount(): Promise<number> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            const result: { count: number }[] = await this._databaseService.query<{ count: number }[]>(
                connection,
                "SELECT COUNT(*) as count FROM games"
            );

            return result[0]?.count || 0;
        }
        catch (e: unknown) {
            throw new Error(`Failed to get games count: ${e}`);
        }
        finally {
            connection.release();
        }
    }
};
