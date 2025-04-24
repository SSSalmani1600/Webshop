import { Request, Response } from "express";
import { CartService, CartItem } from "../services/CartService";

const cartService: CartService = new CartService();

function getSessionIdFromCookie(req: Request): string | null {
    const cookie: string | undefined = req.headers.cookie;
    if (!cookie) return null;

    const match: RegExpMatchArray | null = cookie.match(/session=([^;]+)/);
    return match ? match[1] : null;
}

export class CartController {
    public async getCart(req: Request, res: Response): Promise<void> {
        try {
            const sessionId: string | null = getSessionIdFromCookie(req);

            if (!sessionId) {
                res.status(401).json({ error: "Geen geldige sessie" });
                return;
            }

            const items: CartItem[] = await cartService.getCartItems(sessionId);
            res.json({ cart: items });
        }
        catch (error) {
            console.error("Error fetching cart:", error);
            res.status(500).json({ error: "Kon winkelwagen niet ophalen" });
        }
    }
}
