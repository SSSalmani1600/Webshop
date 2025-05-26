import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";
import { Game } from "@api/types/Game";
import { NewProduct } from "@api/types/NewProduct";

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

    public async addProduct(product: NewProduct): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            console.log("🧾 addProduct() ontvangt:", product);
            await this._databaseService.query(
                connection,
                `
                    INSERT INTO games (title, images, descriptionHtml)
                    VALUES (?)
                    `,
                [product.title, product.images ?? null, product.descriptionHtml]
            );
        }
        catch (e: unknown) {
            console.error("❌ Fout bij uitvoeren INSERT:", e);
            if (e instanceof Error) {
                throw new Error(`Failed to add product: ${e.message}`);
            }
            throw new Error("Unknown error during product insert");
        }

        finally {
            connection.release();
        }
    }

    public async setHidden(id: number, hidden: boolean): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
            console.log("🛠️ Verbergen/tonen game:", { id, hidden });

            await this._databaseService.query(
                connection,
                "UPDATE `games` SET hidden = ? WHERE id = ?",
                hidden ? 1 : 0,
                id
            );
        }
        finally {
            connection.release();
        }
    }
}
