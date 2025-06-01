import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";

interface WishlistItemData {
    gameId: number;
    userId: number;
}

/**
 * Service voor het afhandelen van add to wishlist functionaliteit
 */
export class AddToWishlistService {
    private databaseService: DatabaseService;

    public constructor() {
        this.databaseService = new DatabaseService();
    }

    public async addToWishlist(wishlistItem: WishlistItemData): Promise<{ success: boolean; message: string }> {
        const connection: PoolConnection = await this.databaseService.openConnection();

        try {
            // Controleer of de game bestaat
            const gameExists: boolean = await this.checkGameExists(connection, wishlistItem.gameId);
            if (!gameExists) {
                return {
                    success: false,
                    message: "Game niet gevonden",
                };
            }

            // Controleer of het item al in de favorieten zit
            const existingWishlistItem: { id: number }[] = await this.databaseService.query(
                connection,
                "SELECT * FROM wishlist_items WHERE user_id = ? AND game_id = ?",
                wishlistItem.userId,
                wishlistItem.gameId
            );

            // Als de game al bestaat, stuur een bericht terug
            if (Array.isArray(existingWishlistItem) && existingWishlistItem.length > 0) {
                return {
                    success: false,
                    message: "Game is al toegevoegd aan favorieten",
                };
            }

            // Voeg nieuw item toe aan de favorieten
            await this.databaseService.query(
                connection,
                "INSERT INTO wishlist_items (user_id, game_id) VALUES (?, ?)",
                wishlistItem.userId,
                wishlistItem.gameId
            );

            return {
                success: true,
                message: "Game toegevoegd aan favorieten",
            };
        }
        finally {
            connection.release();
        }
    }

    private async checkGameExists(connection: PoolConnection, gameId: number): Promise<boolean> {
        const result: { id: number }[] = await this.databaseService.query(
            connection,
            "SELECT id FROM games WHERE id = ?",
            gameId
        );
        return Array.isArray(result) && result.length > 0;
    }
}
