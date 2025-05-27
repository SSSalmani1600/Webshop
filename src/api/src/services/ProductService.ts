import { PoolConnection } from "mysql2/promise";
import { DatabaseService } from "./DatabaseService";
import { Game } from "@api/types/Game";
import { NewProduct } from "@api/types/NewProduct";

/**
 * Service class for performing database operations related to products (games).
 */
export class ProductService {
    private readonly _databaseService: DatabaseService = new DatabaseService();

    /**
     * Retrieves all games from the database.
     * @returns Promise containing an array of Game objects.
     * @throws Error if database query fails.
     */
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

    /**
     * Adds a new product (game) to the database.
     * @param product - Object containing product details.
     * @throws Error if insert query fails.
     */
    public async addProduct(product: NewProduct): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
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
            if (e instanceof Error) {
                throw new Error(`Failed to add product: ${e.message}`);
            }
            throw new Error("Unknown error during product insert");
        }
        finally {
            connection.release();
        }
    }

    /**
     * Updates the visibility (hidden status) of a product.
     * @param id - ID of the product to update.
     * @param hidden - Boolean indicating whether to hide (true) or show (false) the product.
     * @throws Error if update query fails.
     */
    public async setHidden(id: number, hidden: boolean): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();

        try {
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
