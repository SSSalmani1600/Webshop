import { DatabaseService } from "./DatabaseService";
import { PoolConnection } from "mysql2/promise";
import type { CartItem } from "../types/CartItem";
import { DiscountService } from "./DiscountService";
import { DiscountValidationResult } from "../interfaces/IDiscountService";

// Deze service regelt alle database operaties voor de winkelwagen
export class CartService {
    // We maken een verbinding met de database
    private readonly _databaseService: DatabaseService = new DatabaseService();
    private readonly _discountService: DiscountService = new DiscountService();

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

    public async updateCartItemQuantity(cartItemId: number, userId: number, quantity: number): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            await connection.execute(
                "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
                [quantity, cartItemId, userId]
            );
        }
        catch (error) {
            console.error("Database error bij updaten cart item quantity:", error);
            throw new Error("Kan hoeveelheid niet bijwerken in database");
        }
        finally {
            connection.release();
        }
    }

    // Bereken het subtotaal van de winkelwagen
    public calculateSubtotal(items: CartItem[]): number {
        return items.reduce((sum, item) => {
            const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;
            return sum + (price * item.quantity);
        }, 0);
    }

    // Bereken het totaal met eventuele korting
    public async calculateCartTotals(items: CartItem[], discountCode: string | undefined, userId: number): Promise<{
        subtotal: number;
        total: number;
        discountPercentage: number;
    }> {
        const subtotal: number = this.calculateSubtotal(items);
        let total: number = subtotal;
        let discountPercentage: number = 0;

        if (discountCode) {
            const validation: DiscountValidationResult = await this._discountService.validateDiscountCode(discountCode, userId);
            if (validation.valid && validation.discountPercentage) {
                discountPercentage = validation.discountPercentage;
                const discountAmount: number = subtotal * (discountPercentage / 100);
                total = subtotal - discountAmount;
            }
        }

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            discountPercentage,
        };
    }

    public async clearCartByUserId(userId: number): Promise<void> {
        const connection: PoolConnection = await this._databaseService.openConnection();
        try {
            await connection.execute(
                "DELETE FROM cart_items WHERE user_id = ?",
                [userId]
            );
        }
        catch (error) {
            console.error("Database error bij legen van winkelmand:", error);
            throw error;
        }
        finally {
            connection.release();
        }
    }
}
