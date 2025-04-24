import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";
import { Game } from "@api/types/Game";

export class ProductService {
    // Create a new instance of the database service for handling DB operations
    private readonly _databaseService: DatabaseService = new DatabaseService();

    // Retrieve all games from the database
    public async getAllGames(): Promise<Game[]> {
        // Open a new connection from the connection pool
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            // Execute the SQL query to select all games
            const result: Game[] = await this._databaseService.query<Game[]>(
                connection,
                `
                SELECT *
                FROM games
                `
            );

            // Return the result of the query
            return result;
        }
        catch (e: unknown) {
            // If an error occurs, throw a new error with a descriptive message
            throw new Error(`Failed to retrieve games: ${e}`);
        }
        finally {
            // Ensure the database connection is released back to the pool
            connection.release();
        }
    }
}
