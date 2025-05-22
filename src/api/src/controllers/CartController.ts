import { Request, Response } from "express";
import { CartService, CartItem } from "../services/CartService";

const cartService: CartService = new CartService();

function getUserIdFromCookie(req: Request): number | null {
    const cookieHeader: string | undefined = req.headers.cookie;
    console.log("COOKIE HEADER:", cookieHeader); // DEBUG

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

            const items: CartItem[] = await cartService.getCartItemsByUser(userId);

            const total: number = items.reduce((sum, item) => {
                const price: number = typeof item.price === "string" ? parseFloat(item.price) : item.price;
                return sum + price * item.quantity;
            }, 0);

            res.json({
                cart: items,
                total,
            });
        }
        catch (error) {
            console.error("Error fetching cart:", error);
            res.status(500).json({ error: "error" });
        }
    }
}
