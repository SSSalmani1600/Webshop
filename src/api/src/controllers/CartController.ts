import { Request, Response } from "express";
import { CartService } from "../services/CartService";
import { CartItem } from "../types/CartItem";
import { Actie } from "../types/Actie";
import { ActionService } from "../services/ActionService";

// Deze controller handelt alle verzoeken af voor de winkelwagen
const cartService: CartService = new CartService();
const actionService: ActionService = new ActionService();

// Deze functie haalt het gebruikers-ID uit de cookie
function getUserIdFromCookie(req: Request): number | null {
    // Haal alle cookies op uit het verzoek
    const cookieHeader: string | undefined = req.headers.cookie;
    if (!cookieHeader) return null;

    // Zoek naar een cookie met de naam 'user' en een nummer als waarde
    const match: RegExpMatchArray | null = cookieHeader.match(/(?:^|;\s*)user=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

interface CartTotals {
    subtotal: number;
    total: number;
    discountPercentage: number;
}

interface UpdateQuantityBody {
    quantity: string;
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

            // Bereken totalen met de CartService
            const totals: CartTotals = await cartService.calculateCartTotals(items, discountCode, userId);

            // Stuur alle informatie terug naar de klant
            res.json({
                cart: items.map(item => ({
                    ...item,
                    // Zorg dat alle prijzen als getallen worden verstuurd
                    price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
                })),
                subtotal: totals.subtotal,
                total: totals.total,
                discountPercentage: totals.discountPercentage,
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
            const items: CartItem[] = await cartService.getCartItemsByUser(userId);
            const toDeleteItem: CartItem | undefined = items.find(item => item.id === cartItemId);

            if (!toDeleteItem) {
                res.status(404).json({ error: "Cart item niet gevonden" });
                return;
            }

            const paidGameId: number = toDeleteItem.game_id;

            await cartService.deleteCartItemById(cartItemId, userId);

            const actie: Actie | null = await actionService.getActieByProductA(paidGameId);

            if (actie) {
                const freeItem: CartItem | undefined = items.find(item => item.game_id === actie.product_b_id);

                if (freeItem) {
                    await cartService.deleteCartItemById(freeItem.id, userId);
                }
            }

            res.status(200).json({
                success: true,
                message: "Product (en eventueel gratis spel) uit winkelwagen verwijderd",
                actieVerwijderd: !!actie,
                gratisProductId: actie ? actie.product_b_id : null,
            });
        }
        catch (error) {
            // Als er iets mis gaat, log de fout en stuur een foutmelding
            console.error("Error deleting cart item:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    public async updateCartItemQuantity(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | null = getUserIdFromCookie(req);
            const cartItemId: number = parseInt(req.params.id, 10);
            const body: UpdateQuantityBody = req.body as UpdateQuantityBody;
            const quantity: number = parseInt(body.quantity, 10);

            if (!userId) {
                res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
                return;
            }

            if (isNaN(cartItemId) || isNaN(quantity) || quantity < 1) {
                res.status(400).json({ error: "Ongeldige item ID of hoeveelheid" });
                return;
            }

            // Update the quantity
            await cartService.updateCartItemQuantity(cartItemId, userId, quantity);

            // Get updated cart to return new totals
            const items: CartItem[] = await cartService.getCartItemsByUser(userId);

            // Check for discount code
            const discountCode: string | undefined = req.query.discountCode as string | undefined;

            // Calculate totals using CartService
            const totals: CartTotals = await cartService.calculateCartTotals(items, discountCode, userId);

            // Send response with all updated values
            res.json({
                success: true,
                cart: items,
                subtotal: totals.subtotal,
                total: totals.total,
                discountPercentage: totals.discountPercentage,
            });
        }
        catch (error) {
            console.error("Error updating cart item quantity:", error);
            res.status(500).json({ error: "Kon hoeveelheid niet bijwerken" });
        }
    }
}
