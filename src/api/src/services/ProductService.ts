import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";
import { Game } from "@api/types/Game";

export class ProductService {
    private readonly _databaseService: DatabaseService = new DatabaseService();

    public async getAllGames(): Promise<Game[]> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            const result: Game[] = await this._databaseService.query<Game[]>(
                connection,
                `
                SELECT *
                FROM games
                `
            );

            return result;
        }
        catch (e: unknown) {
            throw new Error(`Failed to retrieve games: ${e}`);
        }
        finally {
            connection.release();
        }
    }
}
