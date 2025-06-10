import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";

/**
 * Interface voor cart item data (zonder price van client)
 */
interface CartItemData {
    gameId: number;
    quantity: number;
    userId: number;
    isFree?: boolean;
}

/**
 * Interface voor game price response van externe API
 */
interface GamePriceResponse {
    price: number;
    productId: number;
    currency: string;
}

/**
 * Service voor het afhandelen van add to cart functionaliteit
 * Bevat de businesslogica voor het toevoegen van items aan het winkelmandje
 */
export class AddToCartService {
    private databaseService: DatabaseService;

    public constructor() {
        this.databaseService = new DatabaseService();
    }

    /**
     * Voeg een item toe aan het winkelmandje
     *
     * @param cartItem - De cart item data (zonder price)
     * @returns Een promise die wordt resolved als het item is toegevoegd
     */
    public async addToCart(cartItem: CartItemData): Promise<{ success: boolean; message: string }> {
        const connection: PoolConnection = await this.databaseService.openConnection();

        try {
            // Controleer of de game bestaat
            const gameExists: boolean = await this.checkGameExists(connection, cartItem.gameId);
            if (!gameExists) {
                return {
                    success: false,
                    message: "Game niet gevonden",
                };
            }

            // Probeer eerst de externe API, fallback naar €20
            const price: number = await this.getGamePrice(cartItem.gameId);

            // Controleer of het item al in het winkelmandje zit
            const existingCartItem: { id: number }[] = await this.databaseService.query(
                connection,
                "SELECT * FROM cart_items WHERE user_id = ? AND game_id = ?",
                cartItem.userId,
                cartItem.gameId
            );

            // Als het item al bestaat, update de hoeveelheid en prijs
            if (Array.isArray(existingCartItem) && existingCartItem.length > 0) {
                await this.databaseService.query(
                    connection,
                    "UPDATE cart_items SET quantity = quantity + ?, price = ? WHERE user_id = ? AND game_id = ?",
                    cartItem.quantity,
                    price,
                    cartItem.userId,
                    cartItem.gameId
                );

                return {
                    success: true,
                    message: "Hoeveelheid bijgewerkt in winkelmandje",
                };
            }

            // Voeg nieuw item toe aan het winkelmandje
            await this.databaseService.query(
                connection,
                "INSERT INTO cart_items (user_id, game_id, quantity, price) VALUES (?, ?, ?, ?)",
                cartItem.userId,
                cartItem.gameId,
                cartItem.quantity,
                price
            );

            return {
                success: true,
                message: "Product toegevoegd aan winkelmandje",
            };
        }
        finally {
            connection.release();
        }
    }

    /**
     * Haal game prijs op - eerst van externe API, anders fallback naar €20
     *
     * @param gameId - Het ID van de game
     * @returns De prijs van de game
     */
    private async getGamePrice(gameId: number): Promise<number> {
        try {
            // Probeer externe API
            const response: globalThis.Response = await fetch(`http://oege.ie.hva.nl:8889/api/productprices/${gameId}`);

            if (response.ok) {
                const data: GamePriceResponse[] = await response.json() as GamePriceResponse[];
                if (Array.isArray(data) && data.length > 0 && data[0].price) {
                    console.log(`Price fetched from API for game ${gameId}: €${data[0].price}`);
                    return data[0].price;
                }
            }
        }
        catch {
            // API niet bereikbaar - gebruik fallback
            console.log(`External API not available for game ${gameId}, using fallback price €20`);
        }

        // Fallback naar standaardprijs
        console.log(`Using fallback price €20 for game ${gameId}`);
        return 20.00;
    }

    /**
     * Controleer of een game bestaat in de database
     *
     * @param connection - Database connectie
     * @param gameId - Het ID van de game
     * @returns true als de game bestaat, false anders
     */
    private async checkGameExists(connection: PoolConnection, gameId: number): Promise<boolean> {
        try {
            const result: { id: number }[] = await this.databaseService.query(
                connection,
                "SELECT id FROM games WHERE id = ?",
                gameId
            );

            return Array.isArray(result) && result.length > 0;
        }
        catch (error) {
            console.error(`Error checking if game exists for game ${gameId}:`, error);
            return false;
        }
    }
};
