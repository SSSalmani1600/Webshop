import { Request, Response } from "express";
import { CartService } from "../services/CartService";
import { CartItem } from "../types/CartItem";
import { DiscountService } from "../services/DiscountService";
import { DiscountValidationResult } from "../interfaces/IDiscountService";

// Controller die HTTP requests afhandelt voor winkelwagen operaties (ophalen, verwijderen) en kortingen toepast
const cartService: CartService = new CartService();
const discountService: DiscountService = new DiscountService();

// Hulpfunctie om gebruikers-ID uit de cookie te halen
function getUserIdFromCookie(req: Request): number | null {
    const cookieHeader: string | undefined = req.headers.cookie;
    if (!cookieHeader) return null;

    // Zoek naar een cookie met format: user=123
    const match: RegExpMatchArray | null = cookieHeader.match(/(?:^|;\s*)user=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

export class CartController {
    // Haalt winkelwagen op, berekent subtotaal en past eventuele kortingscode toe om eindtotaal te bepalen
    public async getCart(req: Request, res: Response): Promise<void> {
        try {
            // Check of er een geldige gebruiker is
            const userId: number | null = getUserIdFromCookie(req);
            if (!userId) {
                res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
                return;
            }

            // Haal alle items op uit de winkelwagen
            const items: CartItem[] = await cartService.getCartItemsByUser(userId);
            const discountCode: string | undefined = req.query.discountCode as string | undefined;

            // Bereken het subtotaal van alle items
            const subtotal: number = items.reduce((sum, item) => {
                const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                return sum + (price * item.quantity);
            }, 0);

            let total: number = subtotal;
            let discountPercentage: number = 0;

            // Als er een kortingscode is meegegeven, valideer deze en pas korting toe
            if (discountCode) {
                const validation: DiscountValidationResult = await discountService.validateDiscountCode(discountCode, userId);
                if (validation.valid && validation.discountPercentage) {
                    discountPercentage = validation.discountPercentage;
                    const discountAmount: number = subtotal * (discountPercentage / 100);
                    total = subtotal - discountAmount;
                }
            }

            // Rond totaalbedrag af op 2 decimalen
            total = parseFloat(total.toFixed(2));

            // Stuur response met alle winkelwagen informatie
            res.json({
                cart: items.map(item => ({
                    ...item,
                    // Zorg dat alle prijzen als numbers worden verstuurd
                    price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
                })),
                subtotal: parseFloat(subtotal.toFixed(2)),
                total: total,
                discountPercentage: discountPercentage,
            });
        }
        catch (error) {
            console.error("Error fetching cart:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Verwijdert een item uit de winkelwagen na validatie van gebruiker-ID en item-ID combinatie
    public async deleteCartItem(req: Request, res: Response): Promise<void> {
        // Haal gebruiker en item ID op
        const userId: number | null = getUserIdFromCookie(req);
        const cartItemId: number = parseInt(req.params.id, 10);

        // Controleer of beide IDs geldig zijn
        if (!userId || isNaN(cartItemId)) {
            res.status(400).json({ error: "Ongeldige gebruiker of cart item id" });
            return;
        }

        try {
            // Verwijder het item en stuur een success response
            await cartService.deleteCartItemById(cartItemId, userId);
            res.status(204).send();
        }
        catch (error) {
            console.error("Error deleting cart item:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
