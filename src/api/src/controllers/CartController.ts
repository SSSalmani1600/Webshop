import { Request, Response } from "express";
import { CartService } from "../services/CartService";
import { CartItem } from "../types/CartItem";
import { DiscountService } from "../services/DiscountService";
import { DiscountValidationResult } from "../interfaces/IDiscountService";
import { Actie } from "@api/types/Actie";
import { ActionService } from "@api/services/ActionService";

const cartService: CartService = new CartService();
const discountService: DiscountService = new DiscountService();
const actionService: ActionService = new ActionService();

function getUserIdFromCookie(req: Request): number | null {
    const cookieHeader: string | undefined = req.headers.cookie;
    if (!cookieHeader) return null;

    const match: RegExpMatchArray | null = cookieHeader.match(/(?:^|;\s*)user=(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}

export class CartController {
    public async getCart(req: Request, res: Response): Promise<void> {
        try {
            const userId: number | null = getUserIdFromCookie(req);

            if (!userId) {
                res.status(401).json({ error: "Geen geldige gebruiker in cookie" });
                return;
            }

            // Haal cart items op
            const items: CartItem[] = await cartService.getCartItemsByUser(userId);
            const discountCode: string | undefined = req.query.discountCode as string | undefined;

            // Bereken subtotaal
            const subtotal: number = items.reduce((sum, item) => {
                const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                return sum + (price * item.quantity);
            }, 0);

            let total: number = subtotal;
            let discountPercentage: number = 0;

            // Als er een kortingscode is, pas toe
            if (discountCode) {
                const validation: DiscountValidationResult = await discountService.validateDiscountCode(discountCode);
                if (validation.valid && validation.discountPercentage) {
                    discountPercentage = validation.discountPercentage;
                    const discountAmount: number = subtotal * (discountPercentage / 100);
                    total = subtotal - discountAmount;
                }
            }

            // Berken totaalrpijs
            total = parseFloat(total.toFixed(2));

            // Stuur response met alle benodigde informatie
            res.json({
                cart: items.map(item => ({
                    ...item,
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

    public async deleteCartItem(req: Request, res: Response): Promise<void> {
        const userId: number | null = getUserIdFromCookie(req);
        const cartItemId: number = parseInt(req.params.id, 10);

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
            console.error("Error deleting cart item:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
