import { Request, Response } from "express";
import { CartService } from "../services/CartService";
import { CartItem } from "../types/CartItem";
import { DiscountService } from "../services/DiscountService";
import { DiscountValidationResult } from "../interfaces/IDiscountService";

// Deze controller handelt alle verzoeken af voor de winkelwagen
const cartService: CartService = new CartService();
const discountService: DiscountService = new DiscountService();

// Deze functie haalt het gebruikers-ID uit de cookie
function getUserIdFromCookie(req: Request): number | null {
    // Haal alle cookies op uit het verzoek
    const cookieHeader: string | undefined = req.headers.cookie;
    if (!cookieHeader) return null;

    // Zoek naar een cookie met de naam 'user' en een nummer als waarde
    const match: RegExpMatchArray | null = cookieHeader.match(/(?:^|;\s*)user=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

export class CartController {
    // Deze functie haalt de winkelwagen op en berekent de totalen
    public async getCart(req: Request, res: Response): Promise<void> {
        try {
            // Controleer of de gebruiker is ingelogd
            const userId: number | null = getUserIdFromCookie(req);
            if (!userId) {
                res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
                return;
            }

            // Haal alle producten op uit de winkelwagen
            const items: CartItem[] = await cartService.getCartItemsByUser(userId);
            // Kijk of er een kortingscode is meegegeven
            const discountCode: string | undefined = req.query.discountCode as string | undefined;

            // Bereken het totaalbedrag zonder korting
            const subtotal: number = items.reduce((sum, item) => {
                const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                return sum + (price * item.quantity);
            }, 0);

            let total: number = subtotal;
            let discountPercentage: number = 0;

            // Als er een kortingscode is, controleer deze en pas korting toe
            if (discountCode) {
                const validation: DiscountValidationResult = await discountService.validateDiscountCode(discountCode, userId);
                if (validation.valid && validation.discountPercentage) {
                    discountPercentage = validation.discountPercentage;
                    const discountAmount: number = subtotal * (discountPercentage / 100);
                    total = subtotal - discountAmount;
                }
            }

            // Rond het totaalbedrag af op 2 decimalen
            total = parseFloat(total.toFixed(2));

            // Stuur alle informatie terug naar de klant
            res.json({
                cart: items.map(item => ({
                    ...item,
                    // Zorg dat alle prijzen als getallen worden verstuurd
                    price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
                })),
                subtotal: parseFloat(subtotal.toFixed(2)),
                total: total,
                discountPercentage: discountPercentage,
            });
        }
        catch (error) {
            // Als er iets mis gaat, log de fout en stuur een foutmelding
            console.error("Error fetching cart:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Deze functie verwijdert een product uit de winkelwagen
    public async deleteCartItem(req: Request, res: Response): Promise<void> {
        // Haal het gebruikers-ID en product-ID op
        const userId: number | null = getUserIdFromCookie(req);
        const cartItemId: number = parseInt(req.params.id, 10);

        // Controleer of beide IDs geldig zijn
        if (!userId || isNaN(cartItemId)) {
            res.status(400).json({ error: "Ongeldige gebruiker of cart item id" });
            return;
        }

        try {
            // Verwijder het product uit de winkelwagen
            await cartService.deleteCartItemById(cartItemId, userId);
            // Stuur een bevestiging terug
            res.status(204).send();
        }
        catch (error) {
            // Als er iets mis gaat, log de fout en stuur een foutmelding
            console.error("Error deleting cart item:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
