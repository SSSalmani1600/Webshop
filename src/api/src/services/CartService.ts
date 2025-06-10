import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import type { CartItem } from "../types/CartItem";

// Deze service regelt alle database operaties voor de winkelwagen
export class CartService {
    // We maken een verbinding met de database
    private readonly _databaseService: DatabaseService = new DatabaseService();

    // Deze functie haalt alle producten op uit de winkelwagen van een gebruiker
    public async getCartItemsByUser(userId: number): Promise<CartItem[]> {
        // Maak een verbinding met de database
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            // Haal alle items op met een SQL query die winkelwagen en game informatie combineert
            return await this._databaseService.query<CartItem[]>(
                connection,
                `
                SELECT 
                    ci.id,
                    ci.user_id,
                    ci.game_id,
                    ci.quantity,
                    ci.price,
                    g.Title AS title,
                    g.Thumbnail AS thumbnail
                FROM cart_items ci
                JOIN games g ON ci.game_id = g.id
                WHERE ci.user_id = ?
                `,
                userId
            );
        }
        finally {
            // Sluit de database verbinding weer
            connection.release();
        }
    }

    // Deze functie verwijdert een product uit de winkelwagen
    public async deleteCartItemById(cartItemId: number, userId: number): Promise<void> {
        // Maak een verbinding met de database
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            // Verwijder het item, maar alleen als het van deze gebruiker is
            await connection.execute(
                "DELETE FROM cart_items WHERE id = ? AND user_id = ?",
                [cartItemId, userId]
            );
        }
        catch (error) {
            // Als er iets mis gaat, log de fout en geef deze door
            console.error("Database error bij verwijderen cart item:", error);
            throw error;
        }
        finally {
            // Sluit de database verbinding weer
            connection.release();
        }
    }
}
